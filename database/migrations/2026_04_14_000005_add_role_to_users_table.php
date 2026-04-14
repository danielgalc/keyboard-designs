<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 'admin' puede gestionar usuarios, impresoras y eliminar diseños
            // 'operator' puede subir diseños, editar encuadres y registrar verificaciones
            $table->enum('role', ['admin', 'operator'])->default('operator')->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
