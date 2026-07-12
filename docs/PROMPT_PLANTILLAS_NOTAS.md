# Prompt para IA — Creación de plantillas de notas quirúrgicas (NEQx)

Copia y pega este prompt completo en tu asistente de IA. Completa **「DATOS DEL PROCEDIMIENTO」** y, si tienes una nota real o borrador, pégala en **「Ejemplo de nota de la cirugía」**. Cuando la IA responda, pega el JSON en **[Pega el JSON aquí](#pega-el-json-aquí)**.

---

## Rol

Eres un redactor clínico especializado en **notas de enfermería intraoperatoria** en español (Colombia). Tu tarea es redactar **plantillas narrativas** para el sistema **NEQx**, usando variables dinámicas que el sistema reemplazará automáticamente al generar la nota final.

**No escribas la nota ya completada con datos reales.** Escribe únicamente la **plantilla** con placeholders `{{variable}}`.

Si se proporciona un **ejemplo de nota** (con horas, nombres y datos reales), úsalo como **referencia principal de estilo, redacción y estructura**, y conviértelo a plantilla sustituyendo los datos variables por `{{variable}}` del catálogo NEQx.

---

## Cómo funciona el sistema

1. La enfermería llena un formulario (horarios, personal, material, medicación, etc.).
2. Al pulsar **「Generar nota」**, el motor sustituye cada `{{variable}}` por el valor correspondiente.
3. Los párrafos se ordenan **cronológicamente** según la **primera variable de hora** al inicio de cada bloque.
4. Los bloques de **anestesia** se insertan automáticamente desde plantillas compartidas (no van en las secciones del procedimiento, salvo el sufijo en traslado).

### Regla de hora obligatoria

Cada sección del procedimiento **debe comenzar** con su variable de hora:

| Sección     | Variable al inicio |
|-------------|-------------------|
| Ingreso     | `{{h1}}`          |
| Lavado      | `{{h3}}`          |
| Inicio Cx   | `{{h4}}`          |
| Medicación  | `{{h5}}`          |
| Final Cx    | `{{h6}}`          |
| Traslado    | `{{h7}}`          |

La anestesia usa `{{h2}}` (o `{{hAnestesiaGeneral}}` / `{{hBloqueo}}` en casos especiales) en plantillas separadas.

---

## Reglas críticas

1. **Usa solo variables pertinentes a la cirugía solicitada.** El catálogo incluye variables de todas las cirugías; muchas no aplican. No incluyas variables de ortopedia en una colecistectomía, ni variables ginecológicas fuera de histerectomía, etc.
2. **Sintaxis exacta:** `{{nombreVariable}}` — sin espacios, sin mayúsculas arbitrarias.
3. **Texto fijo + variables:** El cuerpo narrativo es texto clínico fijo; solo los datos cambiantes van como variable.
4. **Género y anatomía:** Adapta el texto al procedimiento (paciente/paciente, abdomen/rodilla, etc.).
5. **Tono:** Formal, técnico, estilo nota de enfermería institucional colombiana. Párrafos continuos, sin viñetas.
6. **No inventes variables** que no estén en el catálogo.
7. Para campos de menú desplegable configurados en Firestore, usa `{{id}}` para el valor técnico y `{{idTexto}}` para el texto narrativo en la nota.
8. **Si hay ejemplo de nota adjunto**, respeta su redacción, orden de párrafos y nivel de detalle. Solo reemplaza datos que cambian entre casos (horas, nombres, sala, calibre, lateralidad, tipo de hernia, etc.). No omitas frases del ejemplo salvo que sean exclusivas de un caso puntual.

### Cómo convertir un ejemplo de nota en plantilla

| En la nota de ejemplo | En la plantilla |
|----------------------|-----------------|
| `07:15`, `08:12`, etc. al inicio del párrafo | `{{h1}}`, `{{h3}}`, `{{h4}}`, etc. según la sección |
| `N° 4`, `N.° 3` (sala) | `{{sala}}` |
| `Dr. Edgar Rosero`, `Dra. Andrea Ruano` | `{{cirujano}}`, `{{personaLavado}}`, `{{anestesiologo}}`, etc. |
| ` en conjunto con Dra. …` | `{{textoAyudante}}` *(frase completa; vacía si no aplica)* |
| `18G`, `N° 18` (catéter) | `{{calibre}}` |
| `dorso de la mano` | `{{ubicacionVena}}` |
| `izquierdo`, `derecho` (miembro) | `{{miembro}}` |
| `muslo derecho` (placa bisturí) | `{{placaBisturi}}` |
| `Gasas: 10, Compresas: 5` | `{{stringConteoMaterial}}` |
| `Metoclopramida 10mg EV, …` | `{{stringMedsFinal}}` |
| `sin dejar drenajes` / texto de drenaje | `{{textoDrenajeFinal}}` |
| `general`, `regional raquídea` (en traslado) | `{{sufijoAnestesiaRecup}}` |
| Bloque completo de anestesia (`07:50 Anestesia General…`) | **No incluir** — se inserta automáticamente |
| Tipo de hernia, lateralidad, reemplazo, etc. | `{{tipoHerniaTexto}}`, `{{lateralidadTexto}}`, etc. |

### Condicionales (opciones "No aplica")

Para campos que a veces no aplican (ej. lateralidad), hay **dos formas**:

**1. Usar la variable narrativa `{{idTexto}}` (recomendado)**  
Si el valor es `no_aplica`, `{{lateralidadTexto}}` queda vacío automáticamente:

```
herniorrafía {{tipo_herniaTexto}} vía abierta{{lateralidadTexto}}.
```

- Con lateralidad *derecha* → `…vía abierta derecha.`
- Con *No aplica* → `…vía abierta.`

**2. Bloques condicionales en la plantilla**

| Sintaxis | Cuándo muestra el bloque |
|----------|--------------------------|
| `{{#si variable}}...{{/si}}` | Si la opción aplica (no vacía ni `no_aplica`) |
| `{{#no variable:valor}}...{{/no}}` | Si la variable es **distinta** de `valor` |

Ejemplo explícito para lateralidad:

```
{{h4}} Inicio de cirugía. El Dr. {{cirujano}}{{textoAyudante}} inicia procedimiento quirúrgico de herniorrafía {{tipo_herniaTexto}} vía abierta{{#no lateralidad:no_aplica}}{{lateralidadTexto}}{{/no}}. Se realiza conteo inicial...
```

O con `#si`:

```
... vía abierta{{#si lateralidad}}{{lateralidadTexto}}{{/si}}.
```

> Usa `{{lateralidadTexto}}` dentro del condicional, no `{{lateralidad}}` (que imprime el valor técnico `derecha`, `no_aplica`, etc.).

---

## Estructura de salida requerida

Entrega un JSON con esta forma (o el equivalente en secciones claramente etiquetadas):

```json
{
  "procedimientoKey": "clave_del_procedimiento",
  "label": "Nombre legible del procedimiento",
  "sufijoAnestesia": {
    "raquidea": "texto para traslado si anestesia raquídea",
    "general": "texto para traslado si anestesia general",
    "fallo_raquidea": "texto para traslado si hubo conversión a general"
  },
  "secciones": {
    "ingreso": "...",
    "lavado": "...",
    "inicio": "...",
    "medicacion": "...",
    "final": "...",
    "traslado": "..."
  }
}
```

---

## Pega el JSON aquí

> Borra el contenido de ejemplo y pega la respuesta de la IA. Luego impórtalo en **NEQx → Admin → Plantillas de notas → [procedimiento] → Importar desde JSON (IA)**.

```json
{
  "procedimientoKey": "",
  "label": "",
  "sufijoAnestesia": {
    "raquidea": "",
    "general": "",
    "fallo_raquidea": ""
  },
  "secciones": {
    "ingreso": "",
    "lavado": "",
    "inicio": "",
    "medicacion": "",
    "final": "",
    "traslado": ""
  }
}
```

---

## DATOS DEL PROCEDIMIENTO

> **Completa antes de enviar el prompt:**

- **Nombre del procedimiento:**
- **Clave técnica (procedimientoKey):** ej. `colelap`, `hernias`, `reemplazo`
- **Especialidad:** ej. Cirugía general, Ginecología, Ortopedia
- **Anestesia habitual:** general / raquídea / ambas
- **Campos adicionales del formulario (Firestore):** listar si existen, ej. `tipoHernia`, `lateralidadRodilla`
- **Particularidades anatómicas o de técnica:** región operatoria, posición, drenajes típicos, etc.

---

## Ejemplo de nota de la cirugía *(opcional — recomendado)*

> **Pega aquí una nota completa ya redactada** (con horas, nombres y datos reales). La IA debe **basarse en este texto** para redactar la plantilla: conservar frases, tono y estructura, y solo sustituir los datos variables por `{{variable}}`.
>
> - Puede ser una nota de un caso real, un borrador institucional o una nota de otra cirugía similar a adaptar.
> - Incluye todas las secciones que quieras en la plantilla (ingreso, lavado, inicio, medicación, final, traslado).
> - **No incluyas** el bloque de anestesia si ya está en las plantillas compartidas de NEQx; la IA lo omitirá.
> - Si no adjuntas ejemplo, redacta la plantilla siguiendo el estilo de las referencias de este documento.

```
[PEGA AQUÍ LA NOTA COMPLETA DE LA CIRUGÍA]

Ejemplo de formato esperado:

07:15 Nota de ingreso. Con previa colocación de EPP...
07:50 Anestesia General. [este bloque no va en la plantilla del procedimiento]
08:12 Lavado quirúrgico. Dra. ...
09:40 Inicio de cirugía. Dr. ...
...
```

---

## Catálogo completo de variables

> ⚠️ **No uses todas.** Selecciona solo las que aplican al procedimiento indicado arriba.

### Horarios

| Variable | Descripción |
|----------|-------------|
| `{{h1}}` | Hora de ingreso |
| `{{h2}}` | Hora de anestesia *(plantilla anestesia compartida)* |
| `{{h3}}` | Hora de lavado quirúrgico |
| `{{h4}}` | Hora de inicio de cirugía |
| `{{h5}}` | Hora de medicación |
| `{{h6}}` | Hora de final de cirugía |
| `{{h7}}` | Hora de traslado |
| `{{hAnestesiaGeneral}}` | Hora conversión a anestesia general |
| `{{hBloqueo}}` | Hora de bloqueo regional |

### Procedimiento y sala

| Variable | Descripción |
|----------|-------------|
| `{{sala}}` | Número de sala quirúrgica |
| `{{tipoCirugia}}` | Clave del procedimiento |

### Personal en sala

| Variable | Descripción |
|----------|-------------|
| `{{cirujano}}` | Cirujano principal |
| `{{ayudante}}` | Médico ayudante |
| `{{textoAyudante}}` | Frase ` en conjunto con [ayudante]` — vacía si ayudante es "No aplica" |
| `{{segundoCirujano}}` | Segundo cirujano *(solo ortopedia / reemplazo)* |
| `{{personaLavado}}` | Quien realiza el lavado quirúrgico |
| `{{anestesiologo}}` | Anestesiólogo |
| `{{instrumentador}}` | Instrumentador(a) |

### Acceso venoso y seguridad

| Variable | Descripción |
|----------|-------------|
| `{{calibre}}` | Calibre del catéter venoso |
| `{{ubicacionVena}}` | Ubicación del acceso venoso |
| `{{miembro}}` | Miembro del acceso venoso |
| `{{placaBisturi}}` | Ubicación placa de bisturí |
| `{{tipoDrenaje}}` | Tipo de drenaje seleccionado |
| `{{textoDrenajeFinal}}` | Texto de drenaje para sección final *(incluye coma si aplica)* |
| `{{textoDrenajeFinalSinComa}}` | Texto de drenaje sin coma final *(reemplazo articular)* |
| `{{muestraPatologia}}` | Si hay muestra de patología |
| `{{textoPatologiaFinal}}` | Párrafo completo de espécimen patológico *(vacío si no hay muestra)* |

### Material y medicación

| Variable | Descripción |
|----------|-------------|
| `{{stringConteoMaterial}}` | Conteo de gasas, compresas, mechas, cotonoides |
| `{{stringMedsFinal}}` | Medicamentos intraoperatorios administrados |

### Ginecología *(solo histerectomía y procedimientos ginecológicos)*

| Variable | Descripción |
|----------|-------------|
| `{{sondaFoley}}` | Calibre sonda Foley |
| `{{caracteristicaOrina}}` | Característica de la orina |

### Reemplazo articular *(solo ortopedia / reemplazo)*

| Variable | Descripción |
|----------|-------------|
| `{{tipoReemplazo}}` | Clave: `primario` / `revision` |
| `{{tipoReemplazoTexto}}` | Texto narrativo del tipo de reemplazo |
| `{{lateralidadRodilla}}` | Lateralidad: `derecha` / `izquierda` |
| `{{casa}}` | Casa médica comercial |
| `{{casaMedica}}` | Alias de casa médica *(campo dinámico)* |

### Traslado y anestesia residual

| Variable | Descripción |
|----------|-------------|
| `{{sufijoAnestesiaRecup}}` | Sufijo configurado según modalidad de anestesia (raquídea, general, fallo) |

### Campos adicionales dinámicos *(según procedimiento — Firestore)*

Configurados por especialidad. Ejemplos:

| Procedimiento | Variable | Variable narrativa |
|---------------|----------|-------------------|
| Hernias | `{{tipoHernia}}` | `{{tipoHerniaTexto}}` |
| Reemplazo | `{{lateralidadRodilla}}` | — |
| Reemplazo | `{{tipoReemplazo}}` | `{{tipoReemplazoTexto}}` |
| Reemplazo | `{{casaMedica}}` | — |

> Si se indican campos adicionales en **DATOS DEL PROCEDIMIENTO**, úsalos con la forma `{{id}}` y `{{idTexto}}` (para menús desplegables).

### Variables de anestesia *(plantillas compartidas `_anestesia` — no incluir en secciones del procedimiento)*

`{{h2}}`, `{{hAnestesiaGeneral}}`, `{{hBloqueo}}`, `{{anestesiologo}}`, `{{anestApl}}`, `{{anestLocal}}`, `{{anestAnalgesico}}`, `{{medsAnestesia}}`, `{{tubo}}`, `{{gas}}`, `{{tipoBloqueo}}`, `{{lateralidadBloqueo}}`, `{{stringAnestBloqueo}}`

---

## Variables recomendadas por cirugía

### Colecistectomía laparoscópica (`colelap`)

**Usar:** `h1`–`h7`, `sala`, `cirujano`, `textoAyudante`, `personaLavado`, `instrumentador`, `anestesiologo`, `calibre`, `ubicacionVena`, `miembro`, `placaBisturi`, `stringConteoMaterial`, `stringMedsFinal`, `textoDrenajeFinal`, `textoPatologiaFinal`, `sufijoAnestesiaRecup`

**No usar:** `segundoCirujano`, `sondaFoley`, `caracteristicaOrina`, `lateralidadRodilla`, `tipoReemplazoTexto`, `casa`, campos de bloqueo

**Anestesia:** General fija (sufijo `general`)

---

### Histerectomía abdominal (`histerectomia`)

**Usar:** variables de `colelap` + `sondaFoley`, `caracteristicaOrina` en lavado y traslado. Género femenino en narrativa.

**No usar:** variables de ortopedia

---

### Reemplazo articular (`reemplazo`)

**Usar:** `h1`–`h7`, `cirujano`, `segundoCirujano`, `personaLavado`, `instrumentador`, `anestesiologo`, `tipoReemplazoTexto`, `lateralidadRodilla`, `casa`, `stringConteoMaterial`, `stringMedsFinal`, `textoDrenajeFinalSinComa`, `textoPatologiaFinal`, `sufijoAnestesiaRecup`, `calibre`, `ubicacionVena`, `miembro`

**No usar:** `placaBisturi`, `sondaFoley`, variables ginecológicas

---

### Hernias (`hernias`) — ejemplo con campo adicional

**Usar:** variables base de cirugía general + `{{tipoHerniaTexto}}` en inicio/final donde se nombre el tipo de hernia.

---

## Ejemplo: plantilla vs nota generada

### Plantilla — sección Lavado (`colelap`)

```
{{h3}} Lavado quirúrgico. {{personaLavado}}, previo lavado clínico y antisepsia de manos, realiza el lavado quirúrgico y la preparación antiséptica del área abdominal del paciente, conservando estrictamente la técnica estéril con gluconato de clorhexidina al 4% (jabón) seguido de clorhexidina solución.
```

### Nota generada (datos del formulario reemplazados)

```
08:12 Lavado quirúrgico. Dra. Andrea Ruano, previo lavado clínico y antisepsia de manos, realiza el lavado quirúrgico y la preparación antiséptica del área abdominal del paciente, conservando estrictamente la técnica estéril con gluconato de clorhexidina al 4% (jabón) seguido de clorhexidina solución.
```

### Nota completa generada — colecistectomía laparoscópica (referencia de estilo)

```
07:15 Nota de ingreso. Con previa colocación de Elementos de Protección Personal (EPP: tapabocas N95/quirúrgico, monogafas, careta y guantes) según protocolo institucional, traslado y acompaño a paciente a la sala de cirugía N° 4 en camilla con barandas de protección elevadas para procedimiento quirúrgico programado con Dr. Edgar Rosero. Paciente consciente, alerta, orientado, tolerando aire ambiente sin signos de dificultad respiratoria (disnea) y con tapabocas quirúrgico institucional. Al examen físico: normocéfalo, cuello móvil, tórax simétrico y expandible, abdomen no distendido, extremidades completas, móviles y simétricas. Cuenta con acceso venoso periférico permeable con catéter N° 18G en dorso de la mano de miembro superior izquierdo, fijado a la piel con Tegaderm, por el cual se administra antibiótico profiláctico ordenado, sin signos de infiltración, infección ni flebitis; resto de piel sana. Paciente con alto riesgo de caída (según escala institucional) y bajo riesgo de sufrir lesiones por presión. Ingresa sin pertenencias personales de valor. Se ubica de forma segura en la mesa operatoria en decúbito supino, realizándose la colocación de la placa de retorno del electrobisturí en el muslo derecho sobre piel íntegra, verificando su óptimo contacto. Se inicia monitorización hemodinámica básica no invasiva y se ejecuta la fase de "Entrada" de la lista de verificación de cirugía segura.

07:50 Anestesia General. [bloque insertado automáticamente desde plantilla _anestesia]

08:12 Lavado quirúrgico. Dra. Andrea Ruano, previo lavado clínico y antisepsia de manos, realiza el lavado quirúrgico y la preparación antiséptica del área abdominal del paciente, conservando estrictamente la técnica estéril con gluconato de clorhexidina al 4% (jabón) seguido de clorhexidina solución.

09:40 Inicio de cirugía. Dr. Edgar Rosero en conjunto con Dra. Andrea Ruano inician el procedimiento quirúrgico de colecistectomía laparoscópica. Se realiza el conteo inicial de material blanco (Gasas: 10, Compresas: 5) e instrumental quirúrgico, reportándose completo y verificado bajo la instrumentación quirúrgica de Alexander Benavides Aux.

10:20 Medicación. Por orden médica de Dr. Fernando Arboleda, se administran por vía endovenosa los siguientes medicamentos intraoperatorios: Metoclopramida 10mg EV, Tramal 100mg EV. Se cumple orden médica, paciente recibe y tolera tratamiento farmacológico ordenado sin complicaciones aparentes.

11:50 Final de cirugía. Se termina procedimiento quirúrgico dejando heridas a nivel abdominal suturadas, afrontadas, sin dejar drenajes, y cubiertas con apósito estéril (gasa y cinta microporosa limpia y seca). Conteo de material verificado, cerrado y completo (Gasas: 10, Compresas: 5) e instrumental quirúrgico. Sin complicaciones intraoperatorias aparentes; el paciente tolera el procedimiento en su totalidad.

12:50 Traslado a recuperación. Con el uso adecuado de Elementos de Protección Personal (EPP), se traslada y acompaña al paciente a la sala de recuperación en camilla con barandas de protección elevadas, en postoperatorio de colecistectomía laparoscópica, bajo efectos residuales de anestesia general; responde activamente al llamado, tolera aire ambiente sin signos de dificultad respiratoria y porta tapabocas quirúrgico institucional. Acceso venoso periférico permeable en dorso de la mano de miembro superior izquierdo, fijado con Tegaderm, sin signos de flebitis ni infiltración. Heridas quirúrgicas abdominales cubiertas con apósito estéril, limpio y seco, sin evidencia de sangrado activo. Resto de piel íntegra. Se entrega historia clínica con consentimientos informados debidamente diligenciados y paciente queda bajo monitorización y vigilancia en recuperación postanestésica.
```

---

## Sufijos de anestesia en traslado

Configura los tres sufijos que completan la frase:

> …bajo efectos residuales de anestesia **{{sufijoAnestesiaRecup}}**

| Clave | Ejemplo colecistectomía |
|-------|-------------------------|
| `raquidea` | `regional raquídea` |
| `general` | `general` |
| `fallo_raquidea` | `general secundaria a conversión por fallo de anestesia raquídea` |

---

## Instrucción final para la IA

Con base en **DATOS DEL PROCEDIMIENTO**, el **ejemplo de nota** (si se adjuntó) y las reglas anteriores:

1. Si hay **ejemplo de nota**, úsalo como base: identifica cada sección, conserva la redacción y reemplaza datos variables por `{{variable}}`.
2. Redacta las **6 secciones** del procedimiento (`ingreso`, `lavado`, `inicio`, `medicacion`, `final`, `traslado`).
3. Redacta los **3 sufijos de anestesia** para traslado (extrae del ejemplo la frase tras "anestesia …" en traslado, o redacta según modalidad habitual).
4. Usa **únicamente** variables del catálogo que apliquen a esa cirugía.
5. Mantén coherencia clínica, género anatómico y estilo institucional del ejemplo.
6. Cada sección debe iniciar con su `{{hN}}` correspondiente (sustituye la hora literal del ejemplo).
7. No incluyas bloques de anestesia (`{{h2}}`, tubo, gas, etc.) dentro de las secciones del procedimiento.
8. Entrega el resultado en el formato JSON indicado, listo para importar en NEQx → Admin → Plantillas de notas.

---

## Prompt corto (versión lista para pegar)

```
Crea una plantilla de nota de enfermería intraoperatoria para NEQx.

Procedimiento: [NOMBRE]
Clave: [procedimientoKey]
Especialidad: [ESPECIALIDAD]
Campos adicionales Firestore: [LISTAR o "ninguno"]

Ejemplo de nota de la cirugía (basarte en este texto):
[PEGA AQUÍ LA NOTA COMPLETA — o escribe "sin ejemplo"]

Reglas:
- Si hay ejemplo de nota, CONSÉRVALO como base: misma redacción y estructura, sustituyendo solo datos variables por {{variable}}
- Usa placeholders {{variable}} solo del catálogo NEQx
- Usa SOLO variables que apliquen a este procedimiento
- Cada sección empieza con {{h1}} a {{h7}} según corresponda (reemplaza las horas literales del ejemplo)
- No incluyas el bloque de anestesia en las secciones del procedimiento
- Entrega JSON con: procedimientoKey, label, sufijoAnestesia (raquidea, general, fallo_raquidea), secciones (ingreso, lavado, inicio, medicacion, final, traslado)

Sin ejemplo: usa estilo institucional colombiano como colecistectomía laparoscópica NEQx (EPP, examen físico, conteo material, medicación EV, traslado a recuperación).
```
