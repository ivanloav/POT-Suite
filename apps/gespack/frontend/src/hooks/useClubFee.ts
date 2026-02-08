import { useState, useEffect } from 'react';

interface UseClubFeeProps {
  isPrivilege: string;
  initialPrivilegeFromDB: string | null;
  prevPrivilege: string;
  customerCode: string;
  customer: string;
}

const CLUB_FEE = 3;

export const useClubFee = ({
  isPrivilege,
  customerCode,
  customer,
}: UseClubFeeProps) => {
  const [clubFee, setClubFee] = useState(0);
  const [initialPrivilegeState, setInitialPrivilegeFromDB] = useState<string | null>(null);
  const [prevPrivilegeState, setPrevPrivilege] = useState("");

  // Resetear estado cuando cambia el cliente
  useEffect(() => {
    setInitialPrivilegeFromDB(null);
    setPrevPrivilege("");
    setClubFee(0);
  }, [customer, customerCode]);

  // Sincronizar con valor inicial de la DB
  useEffect(() => {
    if (initialPrivilegeState === null && isPrivilege) {
      setInitialPrivilegeFromDB(isPrivilege);
      setPrevPrivilege(isPrivilege);
    }
  }, [isPrivilege, initialPrivilegeState]);

  // Gestionar cambios de privilegio
  useEffect(() => {
    if (initialPrivilegeState !== null) {
      const wasPrivileged = prevPrivilegeState === "1" || prevPrivilegeState === "true";
      const isNowPrivileged = isPrivilege === "1" || isPrivilege === "true";
      const privilegeChanged = wasPrivileged !== isNowPrivileged;

      if (!privilegeChanged) {
        return;
      }

      const wasInitiallyPrivileged = initialPrivilegeState === "1" || initialPrivilegeState === "true";

      let newFee = 0;
      if (wasInitiallyPrivileged && !isNowPrivileged) {
        newFee = -CLUB_FEE;
      } else if (!wasInitiallyPrivileged && isNowPrivileged) {
        newFee = CLUB_FEE;
      }

      setClubFee(newFee);
      setPrevPrivilege(isPrivilege);
    }
  }, [isPrivilege, prevPrivilegeState, initialPrivilegeState]);

  return {
    clubFee,
    initialPrivilegeFromDB: initialPrivilegeState,
    prevPrivilege: prevPrivilegeState,
    setInitialPrivilegeFromDB,
    setPrevPrivilege,
    setClubFee,
  };
};
