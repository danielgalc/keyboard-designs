<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LaptopBrand extends Model
{
    protected $fillable = ['name'];

    public function models(): HasMany
    {
        return $this->hasMany(LaptopModel::class)->orderBy('name');
    }
}
