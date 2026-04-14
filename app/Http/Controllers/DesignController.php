<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Printer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DesignController extends Controller
{
    public function index(Request $request)
    {
        $designs = Design::with(['creator', 'verifications.printer', 'verifications.user'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                      ->orWhere('laptop_brand', 'ilike', "%{$search}%")
                      ->orWhere('laptop_model', 'ilike', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $printers = Printer::where('active', true)->get();

        return Inertia::render('Designs/Index', [
            'designs'  => $designs,
            'printers' => $printers,
            'filters'  => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Designs/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'laptop_brand'    => 'nullable|string|max:100',
            'laptop_model'    => 'nullable|string|max:100',
            'source_language' => 'nullable|string|max:10',
            'target_language' => 'nullable|string|max:10',
            'description'     => 'nullable|string|max:2000',
            'file'            => 'required|file|max:51200', // 50MB máx
        ]);

        $file = $request->file('file');
        $path = $file->store('designs', 'private');

        $design = Design::create([
            'name'            => $validated['name'],
            'laptop_brand'    => $validated['laptop_brand'] ?? null,
            'laptop_model'    => $validated['laptop_model'] ?? null,
            'source_language' => $validated['source_language'] ?? null,
            'target_language' => $validated['target_language'] ?? null,
            'description'     => $validated['description'] ?? null,
            'file_path'       => $path,
            'file_name'       => $file->getClientOriginalName(),
            'file_mime_type'  => $file->getMimeType(),
            'file_size'       => $file->getSize(),
            'created_by'      => $request->user()->id,
        ]);

        return redirect()->route('designs.show', $design)
            ->with('success', 'Diseño subido correctamente.');
    }

    public function show(Design $design)
    {
        $design->load([
            'creator',
            'printerSettings.printer',
            'printerSettings.updatedBy',
            'verifications' => fn ($q) => $q->with(['printer', 'user'])->latest('verified_at'),
        ]);

        $printers = Printer::where('active', true)->get();

        return Inertia::render('Designs/Show', [
            'design'   => $design,
            'printers' => $printers,
        ]);
    }

    public function download(Design $design)
    {
        return Storage::disk('private')->download(
            $design->file_path,
            $design->file_name
        );
    }

    public function destroy(Design $design)
    {
        Storage::disk('private')->delete($design->file_path);
        $design->delete();

        return redirect()->route('designs.index')
            ->with('success', 'Diseño eliminado.');
    }
}
