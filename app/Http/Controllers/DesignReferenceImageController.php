<?php

namespace App\Http\Controllers;

use App\Models\Design;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DesignReferenceImageController extends Controller
{
    public function show(Design $design)
    {
        abort_if(!$design->reference_image, 404);

        $path = Storage::disk('local')->path($design->reference_image);

        return response()->file($path);
    }

    public function store(Request $request, Design $design)
    {
        $request->validate([
            'image' => 'required|image|max:10240',
        ]);

        // Eliminar imagen anterior si existe
        if ($design->reference_image) {
            Storage::disk('local')->delete($design->reference_image);
        }

        $path = $request->file('image')->store("reference-images/{$design->id}", 'local');
        $design->update(['reference_image' => $path]);

        return back()->with('success', 'Imagen de referencia actualizada.');
    }

    public function destroy(Design $design)
    {
        if ($design->reference_image) {
            Storage::disk('local')->delete($design->reference_image);
            $design->update(['reference_image' => null]);
        }

        return back()->with('success', 'Imagen de referencia eliminada.');
    }
}
