<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Printer extends Model
{
    protected $fillable = ['name', 'model', 'notes', 'active'];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function settings(): HasMany
    {
        return $this->hasMany(PrinterSetting::class);
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(Verification::class);
    }
}
