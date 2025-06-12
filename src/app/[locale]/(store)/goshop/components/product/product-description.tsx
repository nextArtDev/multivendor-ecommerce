// 'use client'
// import DOMPurify from 'dompurify'

// export default function ProductDescription({
//   text,
// }: {
//   text: [string, string]
// }) {
//   const sanitizedDescription1 = DOMPurify.sanitize(text[0])
//   const sanitizedDescription2 = DOMPurify.sanitize(text[1])
//   return (
//     <div className="pt-6">
//       {/* Title */}
//       <div className="h-12">
//         <h2 className="text-main-primary text-2xl font-bold">Description</h2>
//       </div>
//       {/* Display both descriptions */}
//       <div dangerouslySetInnerHTML={{ __html: sanitizedDescription1 }} />
//       <div dangerouslySetInnerHTML={{ __html: sanitizedDescription2 }} />
//     </div>
//   )
// }
'use client'
import sanitizeHtml from 'sanitize-html'

export default function ProductDescription({
  text,
}: {
  text: [string, string]
}) {
  const sanitizedDescription1 = sanitizeHtml(text[0], {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Customize allowed tags if needed
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt'], // Allow specific attributes for <img> tags
    },
  })

  const sanitizedDescription2 = sanitizeHtml(text[1], {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt'],
    },
  })

  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">Description</h2>
      </div>
      {/* Display both descriptions */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedDescription1 }} />
      <div dangerouslySetInnerHTML={{ __html: sanitizedDescription2 }} />
    </div>
  )
}
