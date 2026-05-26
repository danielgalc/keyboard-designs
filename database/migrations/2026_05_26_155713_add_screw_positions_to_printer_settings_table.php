<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->json('screw_positions')->nullable()->after('overprint');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->dropColumn('screw_positions');
        });
    }
};
