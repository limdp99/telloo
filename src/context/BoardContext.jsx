import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const BoardContext = createContext({})

export const useBoard = () => useContext(BoardContext)

export function BoardProvider({ children }) {
  const { user } = useAuth()
  const [boards, setBoards] = useState([])
  const [currentBoard, setCurrentBoard] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserBoards()
    } else {
      setBoards([])
      setLoading(false)
    }
  }, [user])

  const fetchUserBoards = async () => {
    const { data } = await supabase
      .from('boards')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    setBoards(data || [])
    setLoading(false)
  }

  const fetchBoardBySlug = async (slug) => {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!error && data) {
      setCurrentBoard(data)
      if (user) {
        await fetchUserRole(data.id)
      }
    }
    return { data, error }
  }

  const fetchUserRole = async (boardId) => {
    if (!user) {
      setUserRole(null)
      return
    }

    // Check if owner
    const board = boards.find(b => b.id === boardId) || currentBoard
    if (board?.owner_id === user.id) {
      setUserRole('admin')
      return
    }

    // Check user_roles table
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .maybeSingle()

    setUserRole(data?.role || 'user')
  }

  const createBoard = async (title, description, slug) => {
    const { data, error } = await supabase
      .from('boards')
      .insert({
        owner_id: user.id,
        title,
        description,
        slug: slug.toLowerCase(),
      })
      .select()
      .single()

    if (!error) {
      setBoards([data, ...boards])
    }
    return { data, error }
  }

  const updateBoard = async (boardId, updates) => {
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', boardId)
      .select()
      .single()

    if (!error) {
      setBoards(boards.map(b => b.id === boardId ? data : b))
      if (currentBoard?.id === boardId) {
        setCurrentBoard(data)
      }
    }
    return { data, error }
  }

  const deleteBoard = async (boardId) => {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId)

    if (!error) {
      setBoards(boards.filter(b => b.id !== boardId))
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null)
      }
    }
    return { error }
  }

  const value = {
    boards,
    currentBoard,
    userRole,
    loading,
    fetchUserBoards,
    fetchBoardBySlug,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
  }

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  )
}
