<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['name'];

    public function designs(): BelongsToMany
    {
        return $this->belongsToMany(Design::class);
    }
}
