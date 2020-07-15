const express = require('express')
const db = require('../data/db')
const router = express.Router()

// POST
// /
// Creates a post using the information sent inside the request body.
router.post('/', (req, res) => {
    const { title, contents } = req.body

    if (!title || !contents) {res.status(400).json({ error: "Please provide title and contents for the post." })}
    
    db.insert({ title, contents })
        .then(({ id }) => {
            db.findById(id)
                .then(([post]) => {res.status(201).json(post)})
                .catch(err => {res.status(500).json({ error: "There was an error retrieving new post" })})
        })
        .catch(err => {res.status(500).json({ error: "There was an error while saving the post to the database" })})  
})

// POST
// /:id/comments
// Creates a comment for the post with the specified id using information sent inside of the request body.
router.post('/:post_id/comments', (req, res) => {
    const { post_id } = req.params
    const { text } = req.body

    if( !text ) { return res.status( 400 ).json( { error: "Comment requires a string" })}

    db.insertComment({ text, post_id })
        .then(({ id: comment_id }) => {
            db.findCommentById( comment_id )
                .then(([comment]) => {
                    if (comment) {
                        res.status(201).json(comment)
                    } else {
                        res.status(404).json({ error: "Comment with specified ID not found" })
                    }
                })
                .catch(err => { res.status(500).json({ error: `Error retrieving comment: (${err})` }) }) 
        })
        .catch(err => { res.status(500).json({ error: `Error adding comment to post: (${err})` }) }) 
})

// GET
// /
// Returns an array of all the post objects contained in the database.
router.get('/', (req, res) => {
    db.find()
        .then(posts => {res.status(200).json(posts)})
        .catch(error => {res.status(500).json({error: "There was an error while saving the post to the database."})
    })
})

// GET
// /:id
// Returns the post object with the specified id.
router.get('/:id', (req, res) => {
    const { id } = req.params
    db.findById(id)
        .then(posts => {
            const post = posts[0]
            console.log(post)
            if (post) {
                res.status(200).json(post)
            } else {
                res.status(404).json({ error: "Post with id does not exist" })
            }
        })

})

// GET
// /:id/comments
// Returns an array of all the comment objects associated with the post with the specified id.
router.get('/:id/comments', (req, res) => {
    const { id } = req.params
    db.findById(id)
        .then(post => {
            if(post.length > 0){
                db.findPostComments(id)
                    .then(comments => {
                        console.log(comments)
                        res.status(200).json(comments)
                    })
                    .catch(err => {
                        console.log('error fetching comments', err)
                        res.status(500).json({error: "Error getting comments"})
                    })
            } else {
                res.status(404).json({error: "Post with specified ID does not exist."})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: "Error getting comments"})
        })
})

// DELETE
// /:id
// Removes the post with the specified id and returns the deleted post object. You may need to make additional calls to the database in order to satisfy this requirement.
router.delete('/:id', (req, res) => {
    const { id } = req.params
    db.remove(id)
        .then((deleted) => {
            if(deleted){
                console.log(`Post was deleted`)
                res.status(204).end()
            } else {
                res.status(404).json({error: "The post with the specified ID does not exist."})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: "There was an error deleting the post"})
        })
})

// PUT
// /:id
// Updates the post with the specified id using data from the request body. Returns the modified document, NOT the original.
router.put('/:id', (req, res) => {
    const id = req.params.id
    const { title, contents } = req.body

    if (!title || !contents) {return res.status(400).json({ error: "Please provide title and contents to update the post." })}

    db.update(id, { title, contents })
        .then(update => {
            if (update) {
                db.findById(id)
                    .then(post => res.status(200).json(post))
                    .catch(err => {res.status(500).json({error: "Update was good but there was some error"})})
            } else {
                res.status(404).json({ error: "The post with the specified ID does not exist." })
            }
        })
        .catch(err => {res.status(500).json({error: "The post could not be updated."})})
})

module.exports = router