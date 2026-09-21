import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de GoReforma.",
};

export default function PrivacidadPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl">
        <Breadcrumbs
          items={[{ label: "Inicio", href: "/" }, { label: "Privacidad" }]}
        />
        <Badge className="mt-6">Privacidad</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          Política de privacidad
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
          <div>
            <h2 className="font-bold text-slate-900">Responsable del tratamiento</h2>
            <p className="mt-2">
              El responsable del tratamiento de los datos personales recogidos en
              este sitio web es el titular de GoReforma. Puedes contactar con
              el responsable a través del formulario de contacto de la web.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Datos que recogemos</h2>
            <p className="mt-2">
               Cuando decides asociar tus datos a una estimación,
               recogemos los datos que nos facilitas de forma voluntaria: nombre,
               email, teléfono, código postal y el identificador de la estimación.
               No se recogen datos personales para calcular sin tu acción previa.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Finalidad y base legal</h2>
            <p className="mt-2">
               Tus datos se utilizan exclusivamente para asociarlos a la estimación
               que has solicitado guardar, con base legal en tu consentimiento. No
               enviamos presupuestos ni contactos profesionales automáticamente.
               No los cedemos a terceros salvo obligación legal.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Conservación</h2>
            <p className="mt-2">
              Conservamos los datos únicamente durante el tiempo necesario para
              la gestión de la solicitud y después durante los plazos legalmente
              exigidos.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Tus derechos</h2>
            <p className="mt-2">
              Puedes ejercer en cualquier momento tus derechos de acceso,
              rectificación, supresión, oposición, limitación del tratamiento y
              portabilidad, contactando con el responsable. También puedes
              presentar una reclamación ante la Agencia Española de Protección de
              Datos.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
