<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Printer;
use App\Models\PrinterSettingLog;
use Illuminate\Http\Request;

class PrinterSettingController extends Controller
{
    // Campos de configuración que se registran en el log
    private const TRACKED_FIELDS = [
        'offset_x', 'offset_y', 'rotation', 'scale', 'copies',
        'notes', 'ink_type', 'resolution', 'overprint',
    ];

    public function upsert(Request $request, Design $design, Printer $printer)
    {
        $validated = $request->validate([
            'offset_x'   => 'nullable|numeric',
            'offset_y'   => 'nullable|numeric',
            'rotation'   => 'nullable|integer|in:0,90,180,270',
            'scale'      => 'nullable|numeric|min:0|max:999',
            'copies'     => 'nullable|integer|min:1',
            'notes'      => 'nullable|string|max:1000',
            'ink_type'   => 'nullable|string|max:100',
            'resolution' => 'nullable|in:600x600,600x900,600x1200,1200x1200',
            'overprint'  => 'nullable|integer|min:0',
        ]);

        $existing = $design->printerSettings()->where('printer_id', $printer->id)->first();
        $isNew    = $existing === null;

        // Calcular qué campos han cambiado
        $changes = [];
        if (!$isNew) {
            foreach (self::TRACKED_FIELDS as $field) {
                $old = $existing->{$field};
                $new = $validated[$field] ?? null;
                if ((string) $old !== (string) $new) {
                    $changes[$field] = ['from' => $old, 'to' => $new];
                }
            }
        }

        $setting = $design->printerSettings()->updateOrCreate(
            ['printer_id' => $printer->id],
            array_merge($validated, ['updated_by' => $request->user()->id])
        );

        // Solo registrar si hay cambios reales (o es nuevo)
        if ($isNew || !empty($changes)) {
            PrinterSettingLog::create([
                'design_id'  => $design->id,
                'printer_id' => $printer->id,
                'user_id'    => $request->user()->id,
                'action'     => $isNew ? 'created' : 'updated',
                'snapshot'   => collect(self::TRACKED_FIELDS)->mapWithKeys(
                    fn ($f) => [$f => $setting->{$f}]
                )->toArray(),
                'changes'    => $isNew ? null : $changes,
                'logged_at'  => now(),
            ]);
        }

        return back()->with('success', 'Configuración guardada.');
    }
}
