<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Printer;
use Illuminate\Http\Request;

class PrinterSettingController extends Controller
{
    public function upsert(Request $request, Design $design, Printer $printer)
    {
        $validated = $request->validate([
            'offset_x' => 'nullable|numeric',
            'offset_y' => 'nullable|numeric',
            'width'    => 'nullable|numeric|min:0',
            'height'   => 'nullable|numeric|min:0',
            'scale'    => 'nullable|numeric|min:0',
            'copies'   => 'nullable|integer|min:1',
            'notes'    => 'nullable|string|max:1000',
        ]);

        $design->printerSettings()->updateOrCreate(
            ['printer_id' => $printer->id],
            array_merge($validated, ['updated_by' => $request->user()->id])
        );

        return back()->with('success', 'Datos de encuadre guardados.');
    }
}
