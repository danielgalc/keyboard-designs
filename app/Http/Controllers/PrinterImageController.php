<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Printer;
use App\Models\PrinterImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PrinterImageController extends Controller
{
    public function store(Request $request, Design $design, Printer $printer)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10 MB máx
        ]);

        $file = $request->file('image');
        $path = $file->store("printer-images/{$design->id}/{$printer->id}", 'local');

        PrinterImage::create([
            'design_id'   => $design->id,
            'printer_id'  => $printer->id,
            'uploaded_by' => $request->user()->id,
            'file_path'   => $path,
            'file_name'   => $file->getClientOriginalName(),
            'file_size'   => $file->getSize(),
        ]);

        return back()->with('success', 'Imagen añadida.');
    }

    public function show(PrinterImage $image)
    {
        $path = Storage::disk('local')->path($image->file_path);

        return response()->file($path, [
            'Content-Type'        => 'image/jpeg',
            'Content-Disposition' => 'inline; filename="' . $image->file_name . '"',
        ]);
    }

    public function destroy(PrinterImage $image)
    {
        Storage::disk('local')->delete($image->file_path);
        $image->delete();

        return back()->with('success', 'Imagen eliminada.');
    }
}
