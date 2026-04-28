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

        // Totales generales
        $totalDesigns = Design::count();

        // Por impresora: cuántos diseños verificados y cuántos con configuración
        $printerStats = $printers->map(function ($printer) {
            return [
                'id'         => $printer->id,
                'name'       => $printer->name,
                'model'      => $printer->model,
                'verified'   => Verification::where('printer_id', $printer->id)
                                    ->distinct('design_id')->count('design_id'),
                'configured' => PrinterSetting::where('printer_id', $printer->id)->count(),
            ];
        });

        // Diseños que necesitan re-verificación:
        // tienen configuración actualizada DESPUÉS de la última verificación para esa impresora
        $needsReverification = PrinterSetting::select('printer_settings.design_id', 'printer_settings.printer_id')
            ->join(DB::raw('(
                SELECT design_id, printer_id, MAX(verified_at) as last_verified
                FROM verifications
                GROUP BY design_id, printer_id
            ) as lv'), function ($join) {
                $join->on('printer_settings.design_id', '=', 'lv.design_id')
                     ->on('printer_settings.printer_id', '=', 'lv.printer_id');
            })
            ->whereColumn('printer_settings.updated_at', '>', 'lv.last_verified')
            ->distinct()
            ->count();

        // Últimos 6 diseños subidos
        $recentDesigns = Design::with('laptopModel.brand')
            ->latest()
            ->limit(6)
            ->get(['id', 'name', 'language', 'laptop_model_id', 'created_at']);

        // Últimas 8 verificaciones
        $recentVerifications = Verification::with(['design.laptopModel.brand', 'printer', 'user'])
            ->latest('verified_at')
            ->limit(8)
            ->get();

        return Inertia::render('Dashboard', [
            'totalDesigns'        => $totalDesigns,
            'printerStats'        => $printerStats,
            'needsReverification' => $needsReverification,
            'recentDesigns'       => $recentDesigns,
            'recentVerifications' => $recentVerifications,
        ]);
    }
}
