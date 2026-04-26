<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\LaptopBrand;
use App\Models\LaptopModel;
use App\Models\Printer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DesignController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $designs = Design::with([
                'laptopModel.brand',
                'creator',
                'verifications' => fn ($q) => $q->with(['printer', 'user'])->latest('verified_at'),
            ])
            ->when($search, fn ($q) => $q->where(function ($q2) use ($search) {
                $q2->where('name', 'ilike', "%{$search}%")
                   ->orWhere('language', 'ilike', "%{$search}%")
                   ->orWhereHas('laptopModel', fn ($q3) => $q3->where('name', 'ilike', "%{$search}%"))
                   ->orWhereHas('laptopModel.brand', fn ($q3) => $q3->where('name', 'ilike', "%{$search}%"));
            }))
            ->orderBy('created_at')
            ->get();

        $printers = Printer::where('active', true)->get();

        return Inertia::render('Designs/Index', [
            'designs'  => $designs,
            'printers' => $printers,
            'filters'  => $request->only('search'),
        ]);
    }

    public function create()
    {
        $brands = LaptopBrand::with(['models' => fn ($q) => $q->orderBy('name')])
            ->orderBy('name')
            ->get();

        return Inertia::render('Designs/Create', ['brands' => $brands]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand_name'  => 'required|string|max:100',
            'model_name'  => 'required|string|max:100',
            'language'    => 'required|string|max:20',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'file'        => 'required|file|max:51200',
        ]);

        $brand = LaptopBrand::firstOrCreate(['name' => trim($validated['brand_name'])]);
        $model = LaptopModel::firstOrCreate([
            'laptop_brand_id' => $brand->id,
            'name'            => trim($validated['model_name']),
        ]);

        $file = $request->file('file');
        $path = $file->store('designs', 'local');

        $design = Design::create([
            'name'           => $validated['name'],
            'laptop_model_id'=> $model->id,
            'language'       => strtoupper(trim($validated['language'])),
            'description'    => $validated['description'] ?? null,
            'file_path'      => $path,
            'file_name'      => $file->getClientOriginalName(),
            'file_mime_type' => $file->getMimeType(),
            'file_size'      => $file->getSize(),
            'created_by'     => $request->user()->id,
        ]);

        return redirect()->route('designs.show', $design)
            ->with('success', 'Diseño subido correctamente.');
    }

    public function show(Design $design)
    {
        $design->load([
            'laptopModel.brand',
            'creator',
            'printerSettings.printer',
            'printerSettings.updatedBy',
            'verifications' => fn ($q) => $q->with(['printer', 'user'])->latest('verified_at'),
        ]);

        $printers = Printer::where('active', true)->get();

        // Logs de configuración agrupados por impresora
        $settingLogs = \App\Models\PrinterSettingLog::with('user')
            ->where('design_id', $design->id)
            ->latest('logged_at')
            ->get()
            ->groupBy('printer_id');

        return Inertia::render('Designs/Show', [
            'design'      => $design,
            'printers'    => $printers,
            'settingLogs' => $settingLogs,
        ]);
    }

    public function download(Design $design)
    {
        return Storage::disk('local')->download($design->file_path, $design->file_name);
    }

    public function destroy(Design $design)
    {
        Storage::disk('local')->delete($design->file_path);
        $design->delete();

        return redirect()->route('designs.index')->with('success', 'Diseño eliminado.');
    }
}
