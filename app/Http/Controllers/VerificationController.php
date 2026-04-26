<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Printer;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function store(Request $request, Design $design, Printer $printer)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $design->verifications()->create([
            'printer_id'  => $printer->id,
            'user_id'     => $request->user()->id,
            'verified_at' => now(),
            'notes'       => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Verificación registrada.');
    }
}
