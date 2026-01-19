import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function checkAdminAccess(request: NextRequest): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      },
    },
  })

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return false
  }

  const { data: adminRole, error: roleError } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || !adminRole) {
    return false
  }

  return true
}

export async function adminMiddleware(request: NextRequest) {
  const isAdmin = await checkAdminAccess(request)

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}
