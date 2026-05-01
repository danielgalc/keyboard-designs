<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagController extends Controller
{
    public function index()
    {
        return Tag::orderBy('name')->get(['id', 'name']);
    }

    public function adminIndex()
    {
        $tags = Tag::withCount('designs')->orderBy('name')->get();

        return Inertia::render('Admin/Tags', ['tags' => $tags]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:60|unique:tags,name',
        ]);

        Tag::create(['name' => trim(strtolower($validated['name']))]);

        return back()->with('success', 'Etiqueta creada.');
    }

    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:60|unique:tags,name,' . $tag->id,
        ]);

        $tag->update(['name' => trim(strtolower($validated['name']))]);

        return back()->with('success', 'Etiqueta actualizada.');
    }

    public function destroy(Tag $tag)
    {
        $tag->designs()->detach();
        $tag->delete();

        return back()->with('success', 'Etiqueta eliminada.');
    }

    public function destroyUnused()
    {
        $count = Tag::has('designs', '=', 0)->count();
        Tag::has('designs', '=', 0)->delete();

        return back()->with('success', "Se han eliminado {$count} etiqueta(s) sin uso.");
    }

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
