import { Card, CardContent } from '@/components/ui/card'
import { useParams } from '@tanstack/react-router'
import { Edit, Plus } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/button'
import { useEffect } from 'react'
import { useCardIssue } from '../hook/hook-card-issue'

export function CardIssue() {
  // const data = [
  //   {
  //     id: 1,
  //     title: 'Title',
  //     description: 'Description',
  //     link: 'https://github.com/tanstack/tanstack-query',
  //     vote: 10,
  //   },
  //   {
  //     id: 2,
  //     title: 'Title',
  //     description: 'Description',
  //     link: 'https://github.com/tanstack/tanstack-query',
  //     vote: 10,
  //   },
  //   {
  //     id: 3,
  //     title: 'Title',
  //     description: 'Description',
  //     link: 'https://github.com/tanstack/tanstack-query',
  //     vote: 10,
  //   },
  //   {
  //     id: 4,
  //     title: 'Title',
  //     description: 'Description',
  //     link: 'https://github.com/tanstack/tanstack-query',
  //     vote: 10,
  //   },
  //   {
  //     id: 5,
  //     title: 'Title',
  //     description: 'Description',
  //     link: 'https://github.com/tanstack/tanstack-query',
  //     vote: 10,
  //   },
  // ]
  const { id } = useParams({ from: '/_protect/poker/$id/' })
  const {
    handleSelectCardIssue,
    isOpenCardIssue,
    form,
    cardIssue,
    handleSelectCardVote,
    handleStartVote,
  } = useCardIssue()

  useEffect(() => {
    if (id) {
      form.setFieldValue('id', id)
    }
  }, [id])

  const openExternalSite = (path: string) => {
    window.open(path, '_blank', 'noopener,noreferrer')
  }
  return (
    <div className="space-y-4 p-10">
      <Button onClick={() => handleStartVote(id)} variant="default">
        เริ่มโหวต
      </Button>
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] space-y-4">
        {cardIssue.map((item, index) => (
          <Card className="bg-gray-200 border-none text-lg" key={index}>
            <CardContent>
              <div className="space-y-2">
                <div className="h-full flex justify-between items-center text-xl font-bold">
                  {item.title}
                  <Edit />
                </div>
                <Button
                  onClick={() => openExternalSite(item.link)}
                  variant="link"
                  className="m-0 p-0"
                >
                  Link to issue
                </Button>
                <p>{item.description}</p>
                <div className="flex justify-between">
                  <Button
                    variant={item.status === 'now' ? 'default' : 'outline'}
                    onClick={() => handleSelectCardVote(item.cardId, id)}
                  >
                    Vote {item.status}
                  </Button>
                  <div className="border px-3 py-2 rounded-sm">
                    {item.score ?? '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div
        className="flex items-center text-primary-400 space-x-2 hover:cursor-pointer"
        onClick={handleSelectCardIssue}
      >
        <Plus />
        <span className="text-xl font-bold">Add another issue</span>
      </div>
      <Dialog open={isOpenCardIssue} onOpenChange={handleSelectCardIssue}>
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <DialogHeader>
              <DialogTitle>Create Card</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <div className="grid gap-4 py-4">
                {/* ID */}
                <form.Field
                  name="id"
                  children={(field) => (
                    <input
                      type="hidden"
                      name={field.name}
                      value={field.state.value}
                    />
                  )}
                />
                {/* Title Field */}
                <form.Field
                  name="title"
                  children={(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>Title</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {/* แสดง Error Message ถ้ามี */}
                      {field.state.meta.errors ? (
                        <em className="text-xs text-red-500">
                          {field.state.meta.errors}
                        </em>
                      ) : null}
                    </div>
                  )}
                />
                {/* Link Field */}
                <form.Field
                  name="link"
                  children={(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>Link</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                />
                {/* Description Field */}
                <form.Field
                  name="description"
                  children={(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>Description</Label>
                      <Textarea
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                />
              </div>
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
