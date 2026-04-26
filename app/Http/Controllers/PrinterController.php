<?php

namespace App\Http\Controllers;

use App\Models\Printer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrinterController extends Controller
{
    public function index()
    {
        $printers = Printer::withCount(['settings', 'verifications'])->orderBy('name')->get();

        return Inertia::render('Admin/Printers', ['printers' => $printers]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:100|unique:printers,name',
            'model' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        Printer::create(array_merge($validated, ['active' => true]));

        return back()->with('success', 'Impresora añadida.');
    }

    public function update(Request $request, Printer $printer)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:100|unique:printers,name,' . $printer->id,
            'model'  => 'nullable|string|max:100',
            'notes'  => 'nullable|string|max:500',
            'active' => 'boolean',
        ]);

        $printer->update($validated);

        return back()->with('success', 'Impresora actualizada.');
    }

    public function destroy(Printer $printer)
    {
        $printer->delete();
        return back()->with('success', 'Impresora eliminada.');
    }
}
