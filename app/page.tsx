import { MindspaceLanding } from '@/components/mindspace-landing';
import { ClientProviders } from '@/components/client-providers';

export default function HomePage() {
  return (
    <MindspaceLanding
      title="MindSpace"
      description="Gestisci i tuoi progetti creativi in modo semplice ed efficace."
      signInHref="/sign-in"
      signUpHref="/sign-up"
      kpiComponent={<ClientProviders />}
    />
  );
}
