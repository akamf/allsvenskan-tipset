import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NotFoundPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
        <CardDescription>The requested route does not exist.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/">Back to dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
