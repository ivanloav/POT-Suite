USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Correspondencia_Mocall]    Script Date: 02/11/2024 11:09:03 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Correspondencia_Mocall](
	[REF_VENTA] [nvarchar](255) NOT NULL,
	[DESC_VENTA] [nvarchar](255) NULL,
	[REF1] [nvarchar](255) NULL,
	[CAT1] [nvarchar](255) NULL,
	[DESC1] [nvarchar](255) NULL,
	[PRIX1] [nvarchar](255) NULL,
	[REF2] [nvarchar](255) NULL,
	[CAT2] [nvarchar](255) NULL,
	[DESC2] [nvarchar](255) NULL,
	[PRIX2] [nvarchar](255) NULL,
	[REF3] [nvarchar](255) NULL,
	[CAT3] [nvarchar](255) NULL,
	[DESC3] [nvarchar](255) NULL,
	[PRIX3] [nvarchar](255) NULL,
	[REF4] [nvarchar](255) NULL,
	[CAT4] [nvarchar](255) NULL,
	[DESC4] [nvarchar](255) NULL,
	[PRIX4] [nvarchar](255) NULL,
	[REF5] [nvarchar](255) NULL,
	[CAT5] [nvarchar](255) NULL,
	[DESC5] [nvarchar](255) NULL,
	[PRIX5] [nvarchar](255) NULL,
	[REF6] [nvarchar](255) NULL,
	[CAT6] [nvarchar](255) NULL,
	[DESC6] [nvarchar](255) NULL,
	[PRIX6] [nvarchar](255) NULL,
	[REF7] [nvarchar](255) NULL,
	[CAT7] [nvarchar](255) NULL,
	[DESC7] [nvarchar](255) NULL,
	[PRIX7] [nvarchar](255) NULL,
	[REF8] [nvarchar](255) NULL,
	[CAT8] [nvarchar](255) NULL,
	[DESC8] [nvarchar](255) NULL,
	[PRIX8] [nvarchar](255) NULL,
	[REF9] [nvarchar](255) NULL,
	[CAT9] [nvarchar](255) NULL,
	[DESC9] [nvarchar](255) NULL,
	[PRIX9] [nvarchar](255) NULL,
	[REF10] [nvarchar](255) NULL,
	[CAT10] [nvarchar](255) NULL,
	[DESC10] [nvarchar](255) NULL,
	[PRIX10] [nvarchar](255) NULL,
	[TOTAL] [nvarchar](255) NULL,
	[PRIX_PROMO] [nvarchar](255) NULL,
	[REMISE] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[REF_VENTA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


