const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const Post = require('../models/post')
const { isLoggedIn, isPostAuthor } = require('../middleware');

router.get('/', catchAsync(async (req, res) => {
    const posts = await Post.find().populate('author')
    res.render('posts/index', { posts })
}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const post = await Post.findById(id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render(`posts/details`, { post })
}))

router.get('/:id/edit', isLoggedIn, isPostAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    const post = await Post.findById(id).populate('author');
    res.render(`posts/edit`, { post })
}))

router.put('/:id', isLoggedIn, isPostAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    await Post.findByIdAndUpdate(id, req.body)
    res.redirect(`/posts/${id}`)
}))

router.delete('/:id', isLoggedIn, isPostAuthor, catchAsync(async (req, res) => {
    await Post.findByIdAndRemove(req.params.id)
    req.flash('success', 'Post deleted')
    res.redirect('/posts')
}))

router.post('/', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    const post = new Post({ ...req.body, author: user })
    await post.save()
    res.redirect('/posts')
}))

module.exports = router;