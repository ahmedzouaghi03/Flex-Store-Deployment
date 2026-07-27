import type { SerializedOrder, ContactInfo } from "@/types";

const STORE_NAME = "Flex Comfort Shoes";

export function PrintableOrders({
  orders,
  storeInfo,
}: {
  orders: SerializedOrder[];
  storeInfo: ContactInfo;
}) {
  return (
    <div className="hidden print:block">
      {orders.map((order, i) => (
        <div
          key={order.id}
          className={`mx-auto max-w-2xl px-8 py-10 ${i < orders.length - 1 ? "break-after-page" : ""}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-black uppercase tracking-wide text-black">{STORE_NAME}</h1>
            <div className="text-right text-sm text-black">
              <p className="font-semibold">Commande #{order.orderNumber}</p>
              <p>
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Addresses */}
          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-black">Expédier à</p>
              <div className="mt-2 space-y-0.5 text-sm text-black">
                <p>{order.customerName}</p>
                {order.address && <p>{order.address}</p>}
                {order.city && <p>{order.city}</p>}
                <p>Tunisie</p>
                <p>{order.customerPhone}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-black">Facturer à</p>
              <div className="mt-2 space-y-0.5 text-sm text-black">
                <p>{order.customerName}</p>
                {order.address && <p>{order.address}</p>}
                {order.city && <p>{order.city}</p>}
                <p>Tunisie</p>
                <p>{order.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mt-10 border-t-2 border-black pt-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-black">
              <span>Articles</span>
              <span>Quantité</span>
            </div>
          </div>
          <div className="divide-y divide-black/10">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                {item.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.productImage}
                    alt=""
                    className="h-14 w-14 rounded-md border border-black/10 object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-md border border-black/10 bg-black/5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-black">{item.productName}</p>
                  <p className="text-xs text-black/60">
                    {[item.size && `Taille ${item.size}`, item.colorName].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-black">
                  {item.quantity} of {item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-black" />

          {/* Footer */}
          <div className="mt-16 space-y-1 text-center text-sm text-black">
            <p className="mb-4 font-semibold">Merci pour votre achat !</p>
            <p>{STORE_NAME}</p>
            {storeInfo.location && <p>{storeInfo.location}</p>}
            {storeInfo.email && <p>{storeInfo.email}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
