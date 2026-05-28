<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CompositionGroup extends Model
{
    public function designs(): BelongsToMany
    {
        return $this->belongsToMany(Design::class, 'composition_group_design');
    }
}
