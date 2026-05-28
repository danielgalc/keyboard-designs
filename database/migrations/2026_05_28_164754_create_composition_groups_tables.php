<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('composition_groups', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });

        Schema::create('composition_group_design', function (Blueprint $table) {
            $table->foreignId('composition_group_id')->constrained('composition_groups')->cascadeOnDelete();
            $table->foreignId('design_id')->constrained('designs')->cascadeOnDelete();
            $table->primary(['composition_group_id', 'design_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('composition_group_design');
        Schema::dropIfExists('composition_groups');
    }
};
