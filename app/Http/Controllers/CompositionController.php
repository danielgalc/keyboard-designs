<?php

namespace App\Http\Controllers;

use App\Models\CompositionGroup;
use App\Models\Design;
use Illuminate\Http\Request;

class CompositionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'design_ids'   => 'required|array|min:2',
            'design_ids.*' => 'integer|exists:designs,id',
        ]);

        $group = CompositionGroup::create();
        $group->designs()->sync($request->design_ids);

        return back()->with('success', 'Composición creada.');
    }

    public function destroy(CompositionGroup $compositionGroup)
    {
        $compositionGroup->delete();

        return back()->with('success', 'Composición eliminada.');
    }
}
