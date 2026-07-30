import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui';
import { useCreateFeatureFlag } from '@workspace/frontend-core';

const featureFlagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  isEnabled: z.boolean().default(false),
});

type FeatureFlagFormData = z.infer<typeof featureFlagSchema>;

export function FeatureFlagForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FeatureFlagFormData>({
    resolver: zodResolver(featureFlagSchema),
    defaultValues: {
      isEnabled: false,
    }
  });

  const createFeatureFlag = useCreateFeatureFlag();

  const onSubmit = (data: FeatureFlagFormData) => {
    createFeatureFlag.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input 
          {...register('name')} 
          className="w-full px-3 py-2 border rounded-md" 
        />
        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          {...register('description')} 
          className="w-full px-3 py-2 border rounded-md" 
          rows={3}
        />
        {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox"
          id="isEnabled"
          {...register('isEnabled')}
          className="h-4 w-4"
        />
        <label htmlFor="isEnabled" className="text-sm font-medium">Enabled initially</label>
      </div>

      <Button type="submit" disabled={createFeatureFlag.isPending} className="w-full">
        {createFeatureFlag.isPending ? 'Creating...' : 'Create Feature Flag'}
      </Button>
    </form>
  );
}
