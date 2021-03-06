import React, {Component} from 'react';
import update from 'react-addons-update';
import InputForm from "./InputForm";
import Message from "./Message";
import "../styles/results.scss";
import "../styles/input.scss";

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {posts: [],
            updatePostID: -1,
            updateText: "",
            renderUpdateField: false,
            renderSubmitField: false,
            hideOverflow: false};

        this.sendPost = this.sendPost.bind(this);
        this.sendPostUpdate = this.sendPostUpdate.bind(this);
        this.sendPostDelete = this.sendPostDelete.bind(this);
        this.addNewPost = this.addNewPost.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.updatePost = this.updatePost.bind(this);
        this.updateClicked = this.updateClicked.bind(this);
        this.toggleRenderUpdate = this.toggleRenderUpdate.bind(this);
        this.toggleRenderSubmit = this.toggleRenderSubmit.bind(this);
        this.toggleHideContent = this.toggleHideContent.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('new post', (post) => {
            this.addNewPost(post, true);
        });

        this.props.socket.on('update post', (postID, newBody) => {
            this.updatePost(postID, newBody, true);
        });

        this.props.socket.on('delete post', (postID) => {
            this.deletePost(postID, true);
        });

        this.retrievePosts();
        document.querySelector("body").style = "background: #e6ecf0;";
    }

    // -------- Socket methods for passing data between clients --------
    // Send post data so server can distribute to other clients
    sendPost = (post) => {
        this.props.socket.emit('new post', post);
    }

    sendPostUpdate = (postID, newBody) => {
        this.props.socket.emit('update post', postID, newBody);
    }

    sendPostDelete = (postID) => {
        this.props.socket.emit('delete post', postID);
    }

    // -------- CRUD functionality for posts --------
    retrievePosts() {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "/posts", true);

        xhr.onreadystatechange = () => {
            if(xhr.readyState !== 4) return;
            if(xhr.status !== 200){
                // Error!
                return;
            }

            this.setState({posts: JSON.parse(xhr.responseText)});
        }

        xhr.send();
    }

    addNewPost(post, fromOtherClient = false) {
        this.setState({
            posts: this.state.posts.concat([post])
        });

        if(!fromOtherClient) {
            this.sendPost(post);
        }
    }

    deletePost(postID, fromOtherClient = false) {
            let index = this.state.posts.map(x => {
                return x._id;
            }).indexOf(postID);

            if(index !== -1) {
                this.setState({
                    posts: this.state.posts.filter((_, i) => i !== index)
                });
            }

            if(!fromOtherClient) {
                this.sendPostDelete(postID);
            }
    }

    updatePost(postID, newBody, fromOtherClient = false) {
        let index = this.state.posts.map(x => {
            return x._id;
        }).indexOf(postID);

        if(index !== -1) {
            this.setState({
                posts: update(this.state.posts, {[index]: {body: {$set: newBody}}}),
                updatePostID: -1,
                updateText: ""
            })
        }

        if(!fromOtherClient) {
            this.sendPostUpdate(postID, newBody);
        }
    }

    // -------- Control content that gets rendered --------
    updateClicked(postID, body) {
        this.toggleRenderUpdate();
        this.setState({updatePostID: postID, updateText: body});
    }

    toggleRenderUpdate() {
        this.setState({renderUpdateField: !this.state.renderUpdateField});
        this.toggleHideContent();
    }

    toggleRenderSubmit() {
        this.setState({renderSubmitField: !this.state.renderSubmitField});
        this.toggleHideContent();
    }

    toggleHideContent() {
        if(this.state.hideOverflow) {
            // It is currently hidden
            document.body.style.overflow = "visible";
            this.setState({hideOverflow: false});
        } else {
            // It is currently visible
            document.body.style.overflow = "hidden";
            this.setState({hideOverflow: true});
        }
    }

    render() {
        const listItems = [].concat(this.state.posts)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((post) =>
                <Message key={post._id} postID={post._id} body={post.body} creationDate={post.createdAt} removeFromParent={this.deletePost} triggerUpdateForm={this.updateClicked}/>
            );

        // let listItems = this.state.posts.map((post) => <Message key={post._id} postID={post._id} body={post.body} removeFromParent={this.deletePost} triggerUpdateForm={this.updateClicked}/>);

        return (
            <div>
                <div id={"header"}>
                    <div id={"homeLink"}>
                        <a href={"/"}>
                            <svg id="homeImg" width="460.298px" height="460.297px" viewBox="0 0 460.298 460.297">
                                <g>
                                    <g>
                                        <path d="M230.149,120.939L65.986,256.274c0,0.191-0.048,0.472-0.144,0.855c-0.094,0.38-0.144,0.656-0.144,0.852v137.041
                            c0,4.948,1.809,9.236,5.426,12.847c3.616,3.613,7.898,5.431,12.847,5.431h109.63V303.664h73.097v109.64h109.629
                            c4.948,0,9.236-1.814,12.847-5.435c3.617-3.607,5.432-7.898,5.432-12.847V257.981c0-0.76-0.104-1.334-0.288-1.707L230.149,120.939
                            z"/>
                                        <path d="M457.122,225.438L394.6,173.476V56.989c0-2.663-0.856-4.853-2.574-6.567c-1.704-1.712-3.894-2.568-6.563-2.568h-54.816
                            c-2.666,0-4.855,0.856-6.57,2.568c-1.711,1.714-2.566,3.905-2.566,6.567v55.673l-69.662-58.245
                            c-6.084-4.949-13.318-7.423-21.694-7.423c-8.375,0-15.608,2.474-21.698,7.423L3.172,225.438c-1.903,1.52-2.946,3.566-3.14,6.136
                            c-0.193,2.568,0.472,4.811,1.997,6.713l17.701,21.128c1.525,1.712,3.521,2.759,5.996,3.142c2.285,0.192,4.57-0.476,6.855-1.998
                            L230.149,95.817l197.57,164.741c1.526,1.328,3.521,1.991,5.996,1.991h0.858c2.471-0.376,4.463-1.43,5.996-3.138l17.703-21.125
                            c1.522-1.906,2.189-4.145,1.991-6.716C460.068,229.007,459.021,226.961,457.122,225.438z"/>
                                    </g>
                                </g>
                            </svg>
                        </a>
                    </div>

                    <button id="addButton" className={"submitButton"} onClick={this.toggleRenderSubmit}>Add New Post</button>
                </div>
                {(this.state.renderSubmitField === false) ? null : <InputForm unrenderSelf={this.toggleRenderSubmit} className={"postInput"} type="Submit" val="" addToParent={this.addNewPost}/> }
                {(this.state.renderUpdateField === false) ? null : <InputForm  unrenderSelf={this.toggleRenderUpdate} className={"postInput"} ref="updateField" val={this.state.updateText} postID={this.state.updatePostID} type="Update" updateParent={this.updatePost}/>}
                <div id={"messageContainer"}>
                    {listItems}
                </div>
            </div>
        )
    }
}
export default Results;