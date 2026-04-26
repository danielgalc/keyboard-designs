<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('printer_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('design_id')->constrained()->cascadeOnDelete();
            $table->foreignId('printer_id')->constrained()->restrictOnDelete();

            // Datos de encuadre / posicionamiento
            $table->decimal('offset_x', 8, 3)->nullable();   // Desplazamiento horizontal (mm)
            $table->decimal('offset_y', 8, 3)->nullable();   // Desplazamiento vertical (mm)
            $table->decimal('width', 8, 3)->nullable();       // Ancho del área de impresión (mm)
            $table->decimal('height', 8, 3)->nullable();      // Alto del área de impresión (mm)
            $table->decimal('scale', 6, 4)->default(1.0000); // Factor de escala
            $table->integer('copies')->default(1);            // Copias por pasada habitual
            $table->text('notes')->nullable();                // Notas adicionales (p.ej. perfil de color)

            $table->foreignId('updated_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['design_id', 'printer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printer_settings');
    }
};
