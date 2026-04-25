<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LaptopModel extends Model
{
    protected $fillable = ['laptop_brand_id', 'name'];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(LaptopBrand::class, 'laptop_brand_id');
    }

    public function designs(): HasMany
    {
        return $this->hasMany(Design::class)->orderBy('language')->orderBy('name');
    }
}
