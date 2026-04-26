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
            'offset_x'   => 'nullable|numeric',
            'offset_y'   => 'nullable|numeric',
            'rotation'   => 'nullable|integer|in:0,90,180,270',
            'scale'      => 'nullable|numeric|min:0|max:999',
            'copies'      => 'nullable|integer|min:1',
            'notes'       => 'nullable|string|max:1000',
            'ink_type'    => 'nullable|string|max:100',
            'resolution'  => 'nullable|in:600x600,600x900,600x1200,1200x1200',
            'overprint'   => 'nullable|integer|min:0',
        ]);

        $design->printerSettings()->updateOrCreate(
            ['printer_id' => $printer->id],
            array_merge($validated, ['updated_by' => $request->user()->id])
        );

        return back()->with('success', 'Configuración guardada.');
    }
}
