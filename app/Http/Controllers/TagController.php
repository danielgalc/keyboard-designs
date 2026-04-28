<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    // Devuelve todas las etiquetas para autocompletado
    public function index()
    {
        return Tag::orderBy('name')->get(['id', 'name']);
    }

    // Sincroniza las etiquetas de un diseño
    public function sync(Request $request, Design $design)
    {
        $validated = $request->validate([
            'tags'   => 'present|array',
            'tags.*' => 'string|max:60',
        ]);

        $tagIds = collect($validated['tags'])->map(function ($name) {
            return Tag::firstOrCreate(['name' => trim(strtolower($name))])->id;
        });

        $design->tags()->sync($tagIds);

        return back()->with('success', 'Etiquetas actualizadas.');
    }
}
