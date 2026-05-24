<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\DesignComment;
use Illuminate\Http\Request;

class DesignCommentController extends Controller
{
    public function store(Request $request, Design $design)
    {
        $request->validate(['body' => 'required|string|max:2000']);

        $design->comments()->create([
            'user_id' => $request->user()->id,
            'body'    => trim($request->body),
        ]);

        return back();
    }

    public function destroy(Design $design, DesignComment $comment)
    {
        $user = request()->user();
        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $comment->delete();

        return back();
    }
}
