<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Printer;
use App\Models\PrinterSetting;
use App\Models\Verification;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $printers = Printer::where('active', true)->get();

        $totalDesigns = Design::count();

        $printerStats = $printers->map(function ($printer) use ($totalDesigns) {
            $verified   = Verification::where('printer_id', $printer->id)->distinct('design_id')->count('design_id');
            $configured = PrinterSetting::where('printer_id', $printer->id)->count();
            return [
                'id'         => $printer->id,
                'name'       => $printer->name,
                'model'      => $printer->model,
                'verified'   => $verified,
                'configured' => $configured,
                'pending'    => max(0, $totalDesigns - $verified),
            ];
        });

        // Combinaciones diseño+impresora con configuración modificada después de la última verificación
        $staleItems = PrinterSetting::select(
                'printer_settings.design_id',
                'printer_settings.printer_id',
                'printer_settings.updated_at as settings_updated_at',
                DB::raw('lv.last_verified')
            )
            ->join(DB::raw('(
                SELECT design_id, printer_id, MAX(verified_at) as last_verified
                FROM verifications
                GROUP BY design_id, printer_id
            ) as lv'), function ($join) {
                $join->on('printer_settings.design_id', '=', 'lv.design_id')
                     ->on('printer_settings.printer_id', '=', 'lv.printer_id');
            })
            ->whereColumn('printer_settings.updated_at', '>', 'lv.last_verified')
            ->get();

        $needsReverification = $staleItems->count();

        // Cargar los diseños pendientes con contexto completo
        $staleDesigns = Design::with(['laptopModel.brand', 'printerSettings.printer'])
            ->whereIn('id', $staleItems->pluck('design_id')->unique())
            ->get()
            ->map(function ($design) use ($staleItems) {
                $stale = $staleItems->where('design_id', $design->id);
                $design->stale_printers = $stale->pluck('printer_id')->toArray();
                return $design;
            });

        $recentDesigns = Design::with('laptopModel.brand')
            ->latest()
            ->limit(6)
            ->get(['id', 'name', 'language', 'laptop_model_id', 'created_at']);

        $recentVerifications = Verification::with(['design.laptopModel.brand', 'printer', 'user'])
            ->latest('verified_at')
            ->limit(8)
            ->get();

        return Inertia::render('Dashboard', [
            'totalDesigns'        => $totalDesigns,
            'printerStats'        => $printerStats,
            'needsReverification' => $needsReverification,
            'staleDesigns'        => $staleDesigns,
            'recentDesigns'       => $recentDesigns,
            'recentVerifications' => $recentVerifications,
        ]);
    }
}
