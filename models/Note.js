const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const NoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        default: true
    },
    completed: {
        type: Boolean,
        default: false
    },
},
{
    timestamps: true
}
);

NoteSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 1000
});

module.exports = mongoose.model('Note', NoteSchema);