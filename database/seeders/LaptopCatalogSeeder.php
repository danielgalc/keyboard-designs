<?php

namespace Database\Seeders;

use App\Models\LaptopBrand;
use App\Models\LaptopModel;
use Illuminate\Database\Seeder;

class LaptopCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            'HP' => [
                ['device_type' => 'laptop', 'name' => 'EliteBook 840 G5'],
                ['device_type' => 'laptop', 'name' => 'EliteBook 840 G6'],
                ['device_type' => 'laptop', 'name' => 'EliteBook 840 G8'],
                ['device_type' => 'laptop', 'name' => 'ProBook 450 G7'],
                ['device_type' => 'laptop', 'name' => 'ProBook 450 G8'],
            ],
            'Dell' => [
                ['device_type' => 'laptop', 'name' => 'Latitude 5420'],
                ['device_type' => 'laptop', 'name' => 'Latitude 5520'],
                ['device_type' => 'laptop', 'name' => 'Latitude 7420'],
                ['device_type' => 'laptop', 'name' => 'Inspiron 15 3511'],
                ['device_type' => 'laptop', 'name' => 'Vostro 3520'],
            ],
            'Lenovo' => [
                ['device_type' => 'laptop', 'name' => 'ThinkPad E15 Gen 2'],
                ['device_type' => 'laptop', 'name' => 'ThinkPad T14 Gen 2'],
                ['device_type' => 'laptop', 'name' => 'ThinkPad L15 Gen 1'],
                ['device_type' => 'laptop', 'name' => 'IdeaPad 5 15ITL05'],
                ['device_type' => 'laptop', 'name' => 'ThinkPad X1 Carbon Gen 9'],
            ],
        ];

        foreach ($catalog as $brandName => $models) {
            $brand = LaptopBrand::firstOrCreate(['name' => $brandName]);

            foreach ($models as $model) {
                LaptopModel::firstOrCreate(
                    ['laptop_brand_id' => $brand->id, 'name' => $model['name']],
                    ['device_type' => $model['device_type']]
                );
            }
        }
    }
}
