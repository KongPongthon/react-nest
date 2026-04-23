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
import BaseFormInput from '@/components/custom-ui/BaseFormInput'

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
          className="space-y-2"
        >
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
            <DialogDescription>
              <form.Field
                name="name"
                children={(field) => (
                  <BaseFormInput field={field} name="name" title="ชื่อห้อง" />
                )}
              />
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
