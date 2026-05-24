<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DesignComment extends Model
{
    protected $fillable = ['design_id', 'user_id', 'body'];

    public function design()
    {
        return $this->belongsTo(Design::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
