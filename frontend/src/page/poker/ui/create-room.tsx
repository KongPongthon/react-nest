import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useFormCreate } from '../hook/hook-form-create'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface CreateRoomProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateRoom({ isOpen, onClose }: CreateRoomProps) {
  const { form } = useFormCreate({ onClose })
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
            <DialogDescription>
              {/* Create a new room to play poker with your friends. */}

              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.state.values.name}
                  onChange={(e) => form.setFieldValue('name', e.target.value)}
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                data-testid="cancel-button"
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button data-testid="create-button" type="submit">
              Create Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
