import type { AddressRecord } from '../../types/address';
import type { CoinData } from '../../utils/coingecko';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableShell,
} from '../ui/Table';
import { AddressRow } from './AddressRow';

export interface AddressTableProps {
  addresses: AddressRecord[];
  coinDataByType: Record<string, CoinData | null | undefined>;
  copiedAddressId: string | null;
  loadingCoinTypes: Record<string, boolean>;
  onAddAddress: () => void;
  onCopy: (address: AddressRecord) => void;
  onDelete: (address: AddressRecord) => void;
  onEdit: (address: AddressRecord) => void;
}

export function AddressTable({
  addresses,
  coinDataByType,
  copiedAddressId,
  loadingCoinTypes,
  onAddAddress,
  onCopy,
  onDelete,
  onEdit,
}: AddressTableProps) {
  if (addresses.length === 0) {
    return (
      <Card className="px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold text-white">No addresses yet</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
          Save your first address to start building your sending and receiving views.
        </p>
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={onAddAddress}>
            Add your first address
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <TableShell>
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow className="border-t-0 hover:bg-transparent">
              <TableHeaderCell>Saved address</TableHeaderCell>
              <TableHeaderCell>Address</TableHeaderCell>
              <TableHeaderCell>Direction</TableHeaderCell>
              <TableHeaderCell>Added</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addresses.map((address) => (
              <AddressRow
                key={address.id}
                address={address}
                coinData={coinDataByType[address.type]}
                isCoinLoading={Boolean(loadingCoinTypes[address.type])}
                isCopied={copiedAddressId === address.id}
                onCopy={onCopy}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </TableShell>
  );
}
