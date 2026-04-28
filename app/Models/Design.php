<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Design extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'laptop_model_id',
        'language',
        'description',
        'file_path',
        'file_name',
        'file_mime_type',
        'file_size',
        'created_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function laptopModel(): BelongsTo
    {
        return $this->belongsTo(LaptopModel::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function printerSettings(): HasMany
    {
        return $this->hasMany(PrinterSetting::class);
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(Verification::class)->latest('verified_at');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->orderBy('name');
    }

    public function printerImages(): HasMany
    {
        return $this->hasMany(PrinterImage::class)->latest();
    }
}
