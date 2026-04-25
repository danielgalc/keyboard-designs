<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laptop_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laptop_brand_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();

            $table->unique(['laptop_brand_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laptop_models');
    }
};
