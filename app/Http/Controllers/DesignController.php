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
            'device_type' => 'required|in:laptop,tower,sff,mini',
            'model_name'  => 'required|string|max:100',
            'language'    => 'nullable|string|max:20',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'file'        => 'required|file|max:51200',
        ]);

        $brand = LaptopBrand::firstOrCreate(['name' => trim($validated['brand_name'])]);
        $model = LaptopModel::firstOrCreate(
            ['laptop_brand_id' => $brand->id, 'device_type' => $validated['device_type'], 'name' => trim($validated['model_name'])],
            ['device_type' => $validated['device_type']]
        );

        $file = $request->file('file');
        $path = $file->store('designs', 'local');

        $design = Design::create([
            'name'           => $validated['name'],
            'laptop_model_id'=> $model->id,
            'language'       => $validated['language'] ? strtoupper(trim($validated['language'])) : null,
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

    public function traceability(Design $design, Printer $printer)
    {
        $design->load(['laptopModel.brand', 'creator']);

        $settingLogs = \App\Models\PrinterSettingLog::with('user')
            ->where('design_id', $design->id)
            ->where('printer_id', $printer->id)
            ->latest('logged_at')
            ->paginate(20);

        $verifications = \App\Models\Verification::with('user')
            ->where('design_id', $design->id)
            ->where('printer_id', $printer->id)
            ->latest('verified_at')
            ->get();

        return Inertia::render('Designs/Traceability', [
            'design'       => $design,
            'printer'      => $printer,
            'settingLogs'  => $settingLogs,
            'verifications'=> $verifications,
        ]);
    }

    public function edit(Design $design)
    {
        $design->load('laptopModel.brand');

        $brands = LaptopBrand::with(['models' => fn ($q) => $q->orderBy('name')])
            ->orderBy('name')
            ->get();

        return Inertia::render('Designs/Edit', [
            'design' => $design,
            'brands' => $brands,
        ]);
    }

    public function update(Request $request, Design $design)
    {
        $validated = $request->validate([
            'brand_name'  => 'required|string|max:100',
            'device_type' => 'required|in:laptop,tower,sff,mini',
            'model_name'  => 'required|string|max:100',
            'language'    => 'nullable|string|max:20',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'file'        => 'nullable|file|max:51200',
        ]);

        $brand = LaptopBrand::firstOrCreate(['name' => trim($validated['brand_name'])]);
        $model = LaptopModel::firstOrCreate(
            ['laptop_brand_id' => $brand->id, 'device_type' => $validated['device_type'], 'name' => trim($validated['model_name'])],
            ['device_type' => $validated['device_type']]
        );

        $design->name            = $validated['name'];
        $design->laptop_model_id = $model->id;
        $design->language        = $validated['language'] ? strtoupper(trim($validated['language'])) : null;
        $design->description     = $validated['description'] ?? null;

        if ($request->hasFile('file')) {
            Storage::disk('local')->delete($design->file_path);
            $file = $request->file('file');
            $design->file_path      = $file->store('designs', 'local');
            $design->file_name      = $file->getClientOriginalName();
            $design->file_mime_type = $file->getMimeType();
            $design->file_size      = $file->getSize();
        }

        $design->save();

        return redirect()->route('designs.show', $design)
            ->with('success', 'Diseño actualizado correctamente.');
    }

    public function preview(Design $design)
    {
        $path = Storage::disk('local')->path($design->file_path);

        return response()->file($path, [
            'Content-Type'        => $design->file_mime_type ?? 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $design->file_name . '"',
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
