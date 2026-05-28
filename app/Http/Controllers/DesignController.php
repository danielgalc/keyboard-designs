<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\DesignFileVersion;
use App\Models\LaptopBrand;
use App\Models\LaptopModel;
use App\Models\Printer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use ZipArchive;

class DesignController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $designs = Design::with([
                'laptopModel.brand',
                'creator',
                'tags',
                'printerSettings',
                'verifications' => fn ($q) => $q->with(['printer', 'user'])->latest('verified_at'),
                'compositionGroups.designs:id,name',
            ])
            ->when($search, function ($q) use ($search) {
                $terms = array_values(array_filter(array_map('trim', explode(' ', $search))));
                foreach ($terms as $term) {
                    $q->where(function ($q2) use ($term) {
                        $q2->where('name', 'ilike', "%{$term}%")
                           ->orWhere('language', 'ilike', "%{$term}%")
                           ->orWhereHas('laptopModel', fn ($q3) => $q3->where('name', 'ilike', "%{$term}%"))
                           ->orWhereHas('laptopModel.brand', fn ($q3) => $q3->where('name', 'ilike', "%{$term}%"))
                           ->orWhereHas('tags', fn ($q3) => $q3->where('name', 'ilike', "%{$term}%"));
                    });
                }
            })
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

        $languages = Design::whereNotNull('language')->distinct()->orderBy('language')->pluck('language');

        return Inertia::render('Designs/Create', ['brands' => $brands, 'languages' => $languages]);
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
            'file'        => 'required|file|max:51200|mimes:pdf,ai,eps,svg,png,jpg,jpeg,tiff,tif,psd,zip',
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
            'tags',
            'printerSettings.printer',
            'printerSettings.updatedBy',
            'printerImages.uploader',
            'verifications' => fn ($q) => $q->with(['printer', 'user'])->latest('verified_at'),
            'fileVersions.replacedBy',
            'comments.user',
            'compositionGroups.designs:id,name,laptop_model_id',
        ]);

        $printers = Printer::where('active', true)->get();

        // Diseños del mismo modelo (para vincular composiciones)
        $modelDesigns = Design::where('laptop_model_id', $design->laptop_model_id)
            ->where('id', '!=', $design->id)
            ->orderBy('name')
            ->get(['id', 'name', 'language']);

        // Logs de configuración agrupados por impresora
        $settingLogs = \App\Models\PrinterSettingLog::with('user')
            ->where('design_id', $design->id)
            ->latest('logged_at')
            ->get()
            ->groupBy('printer_id');

        $allTags = \App\Models\Tag::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Designs/Show', [
            'design'       => $design,
            'printers'     => $printers,
            'settingLogs'  => $settingLogs,
            'allTags'      => $allTags,
            'modelDesigns' => $modelDesigns,
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

        $languages = Design::whereNotNull('language')->distinct()->orderBy('language')->pluck('language');

        return Inertia::render('Designs/Edit', [
            'design'    => $design,
            'brands'    => $brands,
            'languages' => $languages,
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
            'file'        => 'nullable|file|max:51200|mimes:pdf,ai,eps,svg,png,jpg,jpeg,tiff,tif,psd,zip',
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
            // Archive the current file as a version before replacing
            $nextVersion = $design->fileVersions()->max('version_number') + 1;
            DesignFileVersion::create([
                'design_id'      => $design->id,
                'replaced_by'    => $request->user()->id,
                'file_name'      => $design->file_name,
                'file_path'      => $design->file_path,
                'file_size'      => $design->file_size,
                'version_number' => $nextVersion,
            ]);

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

        $safeName = basename(str_replace(['"', "\r", "\n"], '', $design->file_name));
        return response()->file($path, [
            'Content-Type'        => $design->file_mime_type ?? 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $safeName . '"',
        ]);
    }

    public function download(Design $design)
    {
        return Storage::disk('local')->download($design->file_path, $design->file_name);
    }

    public function downloadComposed(Design $design)
    {
        $design->load('compositionGroups.designs', 'laptopModel.brand');

        $allDesigns = collect([$design]);
        foreach ($design->compositionGroups as $group) {
            foreach ($group->designs as $sibling) {
                if ($sibling->id !== $design->id) {
                    $allDesigns->push($sibling);
                }
            }
        }
        $allDesigns = $allDesigns->unique('id');

        $zip     = new ZipArchive();
        $tmpFile = tempnam(sys_get_temp_dir(), 'composed_');
        $zip->open($tmpFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        foreach ($allDesigns as $d) {
            $filePath = Storage::disk('local')->path($d->file_path);
            if (file_exists($filePath)) {
                $ext      = pathinfo($d->file_name, PATHINFO_EXTENSION);
                $zipEntry = Str::slug($d->name) . ($ext ? ".{$ext}" : '');
                $zip->addFile($filePath, $zipEntry);
            }
        }

        $zip->close();

        $brand   = $design->laptopModel?->brand?->name ?? '';
        $model   = $design->laptopModel?->name ?? '';
        $zipName = Str::slug(implode(' ', array_filter([$brand, $model, $design->name]))) . '.zip';

        return response()->download($tmpFile, $zipName)->deleteFileAfterSend(true);
    }

    public function destroy(Design $design)
    {
        Storage::disk('local')->delete($design->file_path);
        $design->delete();

        return redirect()->route('designs.index')->with('success', 'Diseño eliminado.');
    }
}
