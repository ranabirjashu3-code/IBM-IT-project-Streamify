import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { firebaseAuth } from "../Utils/firebase-config";

const Comments = ({ contentId }) => {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const [menuOpen, setMenuOpen] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    const fetchComments = async () => {
        if (!contentId) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/comments/${contentId}`
            );

            setComments(response.data);
        } catch (error) {
            console.error(
                "Failed to fetch comments:",
                error
            );
        }
    };

    useEffect(() => {
        fetchComments();
    }, [contentId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const user = firebaseAuth.currentUser;

        if (!user) {
            alert("Please login to comment.");
            return;
        }

        if (!text.trim()) {
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/comments/${contentId}`,
                {
                    userId: user.uid,
                    username:
                        user.displayName ||
                        user.email?.split("@")[0] ||
                        "User",
                    userPhoto:
                        user.photoURL || "",
                    text: text.trim()
                }
            );

            setComments((previousComments) => [
                response.data,
                ...previousComments
            ]);

            setText("");

        } catch (error) {
            console.error(
                "Failed to post comment:",
                error.response?.data || error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEditStart = (comment) => {
        setEditingId(comment._id);
        setEditText(comment.text);
        setMenuOpen(null);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditText("");
    };

    const handleEditSave = async (commentId) => {
        const user = firebaseAuth.currentUser;

        if (!user) {
            alert("Please login to edit your comment.");
            return;
        }

        if (!editText.trim()) {
            return;
        }

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
                {
                    userId: user.uid,
                    text: editText.trim()
                }
            );

            setComments((previousComments) =>
                previousComments.map((comment) =>
                    comment._id === commentId
                        ? response.data
                        : comment
                )
            );

            setEditingId(null);
            setEditText("");

        } catch (error) {
            console.error(
                "Failed to edit comment:",
                error.response?.data || error
            );
        }
    };

    const handleDelete = async (commentId) => {
        const user = firebaseAuth.currentUser;

        if (!user) {
            alert("Please login to delete your comment.");
            return;
        }

        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
                {
                    data: {
                        userId: user.uid
                    }
                }
            );

            setComments((previousComments) =>
                previousComments.filter(
                    (comment) =>
                        comment._id !== commentId
                )
            );

            setMenuOpen(null);

        } catch (error) {
            console.error(
                "Failed to delete comment:",
                error.response?.data || error
            );
        }
    };

    return (
        <Container>
            <Title>
                Comments
                <span>{comments.length}</span>
            </Title>

            <CommentForm onSubmit={handleSubmit}>
                <Input
                    value={text}
                    onChange={(event) =>
                        setText(event.target.value)
                    }
                    placeholder="Write a comment..."
                    maxLength={500}
                />

                <SubmitButton
                    type="submit"
                    disabled={
                        loading ||
                        !text.trim()
                    }
                >
                    {loading
                        ? "Posting..."
                        : "Post"}
                </SubmitButton>
            </CommentForm>

            <CommentList>
                {comments.map((comment) => {
                    const user =
                        firebaseAuth.currentUser;

                    const isOwner =
                        user?.uid === comment.userId;

                    return (
                        <CommentItem key={comment._id}>
                            <Avatar>
                                {comment.userPhoto ? (
                                    <img
                                        src={comment.userPhoto}
                                        alt=""
                                    />
                                ) : (
                                    comment.username
                                        ?.charAt(0)
                                        .toUpperCase()
                                )}
                            </Avatar>

                            <CommentContent>
                                <CommentHeader>
                                    <UserName>
                                        {comment.username}
                                    </UserName>

                                    {isOwner && (
                                        <MenuWrapper>
                                            <MenuButton
                                                type="button"
                                                onClick={() =>
                                                    setMenuOpen(
                                                        menuOpen ===
                                                            comment._id
                                                            ? null
                                                            : comment._id
                                                    )
                                                }
                                            >
                                                ⋮
                                            </MenuButton>

                                            {menuOpen ===
                                                comment._id && (
                                                <Menu>
                                                    <MenuItem
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditStart(
                                                                comment
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </MenuItem>

                                                    <MenuItem
                                                        type="button"
                                                        className="delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                comment._id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </MenuItem>
                                                </Menu>
                                            )}
                                        </MenuWrapper>
                                    )}
                                </CommentHeader>

                                {editingId ===
                                comment._id ? (
                                    <EditContainer>
                                        <EditInput
                                            value={editText}
                                            onChange={(event) =>
                                                setEditText(
                                                    event.target.value
                                                )
                                            }
                                            maxLength={500}
                                            autoFocus
                                        />

                                        <EditButtons>
                                            <SaveButton
                                                type="button"
                                                onClick={() =>
                                                    handleEditSave(
                                                        comment._id
                                                    )
                                                }
                                            >
                                                Save
                                            </SaveButton>

                                            <CancelButton
                                                type="button"
                                                onClick={
                                                    handleEditCancel
                                                }
                                            >
                                                Cancel
                                            </CancelButton>
                                        </EditButtons>
                                    </EditContainer>
                                ) : (
                                    <CommentText>
                                        {comment.text}
                                    </CommentText>
                                )}
                            </CommentContent>
                        </CommentItem>
                    );
                })}
            </CommentList>
        </Container>
    );
};



const Container = styled.section`
    width: 100%;
    max-width: 1100px;

    margin: 0 10px 20px;
    padding: 2rem;

    box-sizing: border-box;

    background: #141414;
    border: 1px solid #292929;
    border-radius: 16px;

    color: #ffffff;

    @media (max-width: 768px) {
        margin-top: 2rem;
        padding: 1.35rem;
    }

    @media (max-width: 520px) {
        margin-left: 12px;
        width: calc(100% - 24px);

        padding: 1.1rem;
        border-radius: 12px;
    }
`;

const Title = styled.h2`
    display: flex;
    align-items: center;
    gap: 10px;

    margin: 0 0 1.5rem;

    color: #ffffff;

    font-size: 1.35rem;
    font-weight: 600;
    letter-spacing: 0.2px;

    span {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        min-width: 28px;
        height: 24px;

        padding: 0 7px;

        box-sizing: border-box;

        border-radius: 12px;

        background: #252a34;
        color: #aeb4c0;

        font-size: 0.78rem;
        font-weight: 600;
        line-height: 1;
    }

    @media (max-width: 520px) {
        margin-bottom: 1.2rem;

        font-size: 1.15rem;

        span {
            min-width: 25px;
            height: 22px;

            font-size: 0.72rem;
        }
    }
`;

const CommentForm = styled.form`
    display: flex;
    align-items: center;
    gap: 12px;

    width: 100%;

    margin-bottom: 2rem;

    @media (max-width: 520px) {
        flex-direction: column;
        align-items: stretch;

        gap: 9px;

        margin-bottom: 1.5rem;
    }
`;

const Input = styled.input`
    flex: 1;

    width: 100%;
    min-width: 0;
    height: 46px;

    padding: 0 15px;

    box-sizing: border-box;

    border: 1px solid #2a2f39;
    border-radius: 10px;
    outline: none;

    background: #191c23;
    color: #ffffff;

    font-family: inherit;
    font-size: 0.92rem;

    transition:
        border-color 0.2s ease,
        background 0.2s ease,
        box-shadow 0.2s ease;

    &::placeholder {
        color: #777e8b;
    }

    &:hover {
        border-color: #363c48;
    }

    &:focus {
        border-color: #5d6573;
        background: #1c2028;

        box-shadow:
            0 0 0 3px rgba(255, 255, 255, 0.04);
    }

    @media (max-width: 520px) {
        height: 44px;

        padding: 0 13px;

        font-size: 0.88rem;
    }
`;

const SubmitButton = styled.button`
    flex-shrink: 0;

    height: 46px;

    padding: 0 20px;

    border: none;
    border-radius: 10px;

    background: #ffffff;
    color: #111318;

    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;

    cursor: pointer;

    transition:
        transform 0.2s ease,
        background 0.2s ease,
        opacity 0.2s ease;

    &:hover:not(:disabled) {
        background: #e8e8e8;

        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.45;

        cursor: not-allowed;
    }

    @media (max-width: 520px) {
        width: 100%;
        height: 44px;

        font-size: 0.88rem;
    }
`;

const CommentList = styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;
`;

const CommentItem = styled.article`
    position: relative;

    display: flex;
    gap: 14px;

    width: 100%;

    padding: 1.35rem 0;

    box-sizing: border-box;

    border-bottom: 1px solid #242832;

    &:first-child {
        padding-top: 0.5rem;
    }

    &:last-child {
        padding-bottom: 0.5rem;

        border-bottom: none;
    }

    @media (max-width: 520px) {
        gap: 10px;

        padding: 1.15rem 0;
    }
`;

const Avatar = styled.div`
    flex-shrink: 0;

    width: 42px;
    height: 42px;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;

    border-radius: 50%;

    background: #292e38;
    color: #ffffff;

    font-size: 0.95rem;
    font-weight: 600;

    img {
        display: block;

        width: 100%;
        height: 100%;

        object-fit: cover;
    }

    @media (max-width: 520px) {
        width: 36px;
        height: 36px;

        font-size: 0.82rem;
    }
`;

const CommentContent = styled.div`
    position: relative;

    flex: 1;

    min-width: 0;

    padding-right: 38px;

    box-sizing: border-box;

    @media (max-width: 520px) {
        padding-right: 32px;
    }
`;

const CommentHeader = styled.div`
    display: flex;
    align-items: center;

    width: 100%;

    min-height: 30px;
`;

const UserName = styled.div`
    max-width: 100%;

    margin-bottom: 5px;

    color: #f2f3f5;

    font-size: 0.92rem;
    font-weight: 600;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 520px) {
        font-size: 0.87rem;
    }
`;

const CommentText = styled.p`
    margin: 0;

    color: #b6bbc5;

    font-size: 0.91rem;
    line-height: 1.6;

    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;

    @media (max-width: 520px) {
        font-size: 0.86rem;
        line-height: 1.55;
    }
`;

const MenuWrapper = styled.div`
    position: absolute;

    top: -2px;
    right: 0;

    z-index: 50;
`;

const MenuButton = styled.button`
    width: 34px;
    height: 34px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;
    border-radius: 50%;

    background: transparent;
    color: #8c939f;

    font-family: inherit;
    font-size: 1.35rem;
    font-weight: 600;
    line-height: 1;

    cursor: pointer;

    transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.15s ease;

    &:hover {
        background: #252a33;
        color: #ffffff;
    }

    &:active {
        background: #2c323d;

        transform: scale(0.94);
    }

    @media (max-width: 520px) {
        width: 30px;
        height: 30px;

        font-size: 1.2rem;
    }
`;

const Menu = styled.div`
    position: absolute;

    top: 38px;
    right: 0;

    width: 140px;

    padding: 6px;

    box-sizing: border-box;

    border: 1px solid #2b3039;
    border-radius: 10px;

    background: #1a1d24;

    box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.45),
        0 3px 8px rgba(0, 0, 0, 0.25);

    overflow: hidden;

    animation: menuAppear 0.15s ease-out;

    @keyframes menuAppear {
        from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: 520px) {
        width: 125px;
    }
`;

const MenuItem = styled.button`
    width: 100%;

    display: flex;
    align-items: center;

    padding: 10px 12px;

    border: none;
    border-radius: 7px;

    background: transparent;
    color: #d8dbe1;

    font-family: inherit;
    font-size: 0.86rem;
    font-weight: 500;

    text-align: left;

    cursor: pointer;

    transition:
        background 0.18s ease,
        color 0.18s ease;

    &:hover {
        background: #272c35;
        color: #ffffff;
    }

    &.delete {
        color: #ff7b7b;
    }

    &.delete:hover {
        background: rgba(255, 75, 75, 0.1);
        color: #ff6b6b;
    }

    @media (max-width: 520px) {
        padding: 9px 11px;

        font-size: 0.82rem;
    }
`;

const EditContainer = styled.div`
    width: 100%;
`;

const EditInput = styled.textarea`
    width: 100%;
    min-height: 82px;

    padding: 12px 13px;

    box-sizing: border-box;

    resize: vertical;

    border: 1px solid #3a404b;
    border-radius: 9px;
    outline: none;

    background: #191c23;
    color: #ffffff;

    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.5;

    transition:
        border-color 0.2s ease,
        background 0.2s ease,
        box-shadow 0.2s ease;

    &::placeholder {
        color: #777e8b;
    }

    &:hover {
        border-color: #454c58;
    }

    &:focus {
        border-color: #626a78;
        background: #1c2028;

        box-shadow:
            0 0 0 3px rgba(255, 255, 255, 0.04);
    }

    @media (max-width: 520px) {
        min-height: 75px;

        padding: 10px 11px;

        font-size: 0.86rem;
    }
`;

const EditButtons = styled.div`
    display: flex;
    align-items: center;

    gap: 8px;

    margin-top: 9px;
`;

const SaveButton = styled.button`
    padding: 8px 15px;

    border: none;
    border-radius: 8px;

    background: #ffffff;
    color: #111318;

    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 600;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease;

    &:hover {
        background: #e7e7e7;

        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 520px) {
        padding: 7px 13px;

        font-size: 0.78rem;
    }
`;

const CancelButton = styled.button`
    padding: 8px 15px;

    border: 1px solid #343a45;
    border-radius: 8px;

    background: transparent;
    color: #aeb4bf;

    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 500;

    cursor: pointer;

    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease;

    &:hover {
        border-color: #4a515e;
        background: #22262e;
        color: #ffffff;
    }

    @media (max-width: 520px) {
        padding: 7px 13px;

        font-size: 0.78rem;
    }
`;

export default Comments;