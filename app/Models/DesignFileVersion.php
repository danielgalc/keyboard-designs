<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DesignFileVersion extends Model
{
    protected $fillable = ['design_id', 'replaced_by', 'file_name', 'file_path', 'file_size', 'version_number'];

    public function design()
    {
        return $this->belongsTo(Design::class);
    }

    public function replacedBy()
    {
        return $this->belongsTo(User::class, 'replaced_by');
    }
}
