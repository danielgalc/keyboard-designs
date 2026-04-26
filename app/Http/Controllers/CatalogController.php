<?php

namespace App\Http\Controllers;

use App\Models\LaptopBrand;
use App\Models\LaptopModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        $brands = LaptopBrand::with(['models' => fn ($q) => $q->withCount('designs')])
            ->withCount('models')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Catalog', ['brands' => $brands]);
    }

    public function storeBrand(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:laptop_brands,name',
        ]);

        LaptopBrand::create($validated);

        return back()->with('success', 'Marca añadida.');
    }

    public function updateBrand(Request $request, LaptopBrand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:laptop_brands,name,' . $brand->id,
        ]);

        $brand->update($validated);

        return back()->with('success', 'Marca actualizada.');
    }

    public function destroyBrand(LaptopBrand $brand)
    {
        $brand->delete();
        return back()->with('success', 'Marca eliminada.');
    }

    public function storeModel(Request $request, LaptopBrand $brand)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'device_type' => 'required|in:laptop,tower,sff,mini',
        ]);

        $brand->models()->firstOrCreate(
            ['name' => $validated['name'], 'device_type' => $validated['device_type']]
        );

        return back()->with('success', 'Modelo añadido.');
    }

    public function updateModel(Request $request, LaptopModel $model)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $model->update($validated);

        return back()->with('success', 'Modelo actualizado.');
    }

    public function destroyModel(LaptopModel $model)
    {
        $model->delete();
        return back()->with('success', 'Modelo eliminado.');
    }
}
