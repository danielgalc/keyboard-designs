<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laptop_models', function (Blueprint $table) {
            $table->string('device_type', 20)->default('laptop')->after('laptop_brand_id');
        });

        // Los modelos existentes (portátiles) quedan como 'laptop' por defecto
    }

    public function down(): void
    {
        Schema::table('laptop_models', function (Blueprint $table) {
            $table->dropColumn('device_type');
        });
    }
};
