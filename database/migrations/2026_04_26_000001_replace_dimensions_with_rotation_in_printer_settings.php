<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->dropColumn(['width', 'height']);
            $table->unsignedSmallInteger('rotation')->default(0)->after('offset_y');
        });
    }

    public function down(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->dropColumn('rotation');
            $table->decimal('width', 8, 3)->nullable();
            $table->decimal('height', 8, 3)->nullable();
        });
    }
};
