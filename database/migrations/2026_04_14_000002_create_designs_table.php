<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('designs', function (Blueprint $table) {
            $table->id();
            $table->string('name');                        // Nombre del diseño, ej: "HP 15s-fq5xxx ES→EN"
            $table->string('laptop_brand')->nullable();    // Marca del portátil, ej: "HP"
            $table->string('laptop_model')->nullable();    // Modelo del portátil, ej: "15s-fq5xxx"
            $table->string('source_language', 10)->nullable(); // Idioma origen, ej: "ES"
            $table->string('target_language', 10)->nullable(); // Idioma destino, ej: "EN"
            $table->text('description')->nullable();
            $table->string('file_path');                   // Ruta del archivo en storage
            $table->string('file_name');                   // Nombre original del archivo
            $table->string('file_mime_type')->nullable();  // ej: application/pdf
            $table->unsignedBigInteger('file_size')->nullable(); // Tamaño en bytes
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('designs');
    }
};
